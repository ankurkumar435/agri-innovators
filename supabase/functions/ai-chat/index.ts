import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  userId: z.string().uuid().optional(),
  userLat: z.number().min(-90).max(90).optional(),
  userLon: z.number().min(-180).max(180).optional(),
  language: z.string().max(20).optional(),
});

const has = (text: string, words: string[]) => words.some((w) => text.includes(w.toLowerCase()));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { message, userLat, userLon } = parsed.data;
    const q = message.toLowerCase();

    // ---------- Gather the farmer's own data ----------
    const [{ data: locationRow }, { data: fields }, { data: yields }, { data: activities }] = await Promise.all([
      supabase.from('user_locations').select('latitude, longitude, city, region, country')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('farmer_fields')
        .select('name, area_acres, crop, growth_stage, sowing_date, expected_harvest_date, center_lat, center_lng')
        .eq('user_id', userId),
      supabase.from('yields').select('crop_type, season, area_planted, expected_yield, current_yield').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('farmer_activities').select('title, status, scheduled_time').eq('user_id', userId).limit(10),
    ]);

    const lat = userLat ?? (locationRow?.latitude as number | undefined) ?? (fields?.[0] as any)?.center_lat;
    const lon = userLon ?? (locationRow?.longitude as number | undefined) ?? (fields?.[0] as any)?.center_lng;
    const state = (locationRow?.region as string | undefined) ?? undefined;
    const city = (locationRow?.city as string | undefined) ?? undefined;

    // ---------- Decide which live feeds to pull ----------
    const wantsWeather = has(q, ['weather', 'temperature', 'rain', 'climate', 'forecast', 'sunny', 'cloud', 'humid', 'wind', 'irrigat', 'spray',
      'मौसम', 'तापमान', 'बारिश', 'जलवायु', 'धूप', 'बादल', 'हवा', 'सिंचाई',
      'ਮੌਸਮ', 'ਬਾਰਿਸ਼', 'हवामान', 'पाऊस']);
    const wantsSoil = has(q, ['soil', 'ph', 'nutrient', 'nitrogen', 'phosph', 'potash', 'potassium', 'fertiliz', 'fertilis', 'manure', 'urea', 'compost', 'organic carbon',
      'मिट्टी', 'मिट्टी', 'खाद', 'उर्वरक', 'पोषक', 'माती', 'ਮਿੱਟੀ']);
    const wantsMarket = has(q, ['price', 'market', 'mandi', 'sell', 'rate', 'profit', 'cost', 'demand',
      'भाव', 'कीमत', 'मंडी', 'बाजार', 'दाम', 'ਮੰਡੀ', 'ਭਾਅ', 'बाजारभाव']);
    const wantsPest = has(q, ['pest', 'insect', 'disease', 'fungus', 'blight', 'infest', 'bug', 'worm', 'spray', 'infection',
      'कीट', 'रोग', 'बीमारी', 'फफूंद', 'ਕੀੜੇ', 'ਰੋਗ', 'कीड']);
    const generic = !wantsWeather && !wantsSoil && !wantsMarket && !wantsPest;

    const invoke = async (fn: string, body: Record<string, unknown>) => {
      try {
        const { data, error } = await supabase.functions.invoke(fn, { body });
        if (error) { console.error(`${fn} error`, error); return null; }
        return data;
      } catch (e) { console.error(`${fn} threw`, e); return null; }
    };

    const [weather, soil, market] = await Promise.all([
      (wantsWeather || wantsPest || generic) && lat && lon ? invoke('weather', { lat, lon }) : Promise.resolve(null),
      (wantsSoil || wantsPest) ? invoke('soil-conditions', { state, city, latitude: lat, longitude: lon }) : Promise.resolve(null),
      wantsMarket ? invoke('market-prices', { state, city }) : Promise.resolve(null),
    ]);

    // ---------- Build the context block ----------
    const parts: string[] = [];

    if (locationRow || lat) {
      parts.push(`FARMER LOCATION: ${[city, state, locationRow?.country].filter(Boolean).join(', ') || 'unknown'}${lat && lon ? ` (lat ${Number(lat).toFixed(3)}, lon ${Number(lon).toFixed(3)})` : ''}`);
    }

    if (fields?.length) {
      const totalAcres = fields.reduce((s: number, f: any) => s + Number(f.area_acres || 0), 0);
      parts.push(`FARMER FIELDS (${fields.length}, total ${totalAcres.toFixed(2)} acres):\n` +
        fields.map((f: any) => `• ${f.name}: ${Number(f.area_acres || 0).toFixed(2)} acres, crop ${f.crop || 'not set'}, stage ${f.growth_stage || 'not set'}${f.sowing_date ? `, sown ${f.sowing_date}` : ''}${f.expected_harvest_date ? `, harvest ~${f.expected_harvest_date}` : ''}`).join('\n'));
    }

    if (yields?.length) {
      parts.push(`PAST YIELDS: ${yields.map((y: any) => `${y.crop_type} (${y.season || 'n/a'}) on ${y.area_planted ?? '?'} acres, expected ${y.expected_yield ?? '?'} / current ${y.current_yield ?? '?'}`).join('; ')}`);
    }

    if (activities?.length) {
      parts.push(`TODAY'S ACTIVITIES: ${activities.map((a: any) => `${a.title} [${a.status}]`).join('; ')}`);
    }

    if (weather?.current) {
      parts.push(`LIVE WEATHER (${weather.location?.name ?? city ?? 'field'}):
• Now: ${weather.current.temp}°C, ${weather.current.condition}, humidity ${weather.current.humidity}%, wind ${weather.current.windSpeed} km/h
• 7-day forecast: ${(weather.forecast ?? []).map((d: any) => `${d.day} ${d.temp}°C ${d.condition}`).join(' | ')}
• Active alerts: ${(weather.alerts ?? []).length ? weather.alerts.map((a: any) => `${a.title} (${a.severity}) - ${a.description}`).join(' | ') : 'none'}`);
    }

    if (soil?.soilProfile) {
      const n = soil.primaryNutrients ?? {};
      const fmt = (k: string) => n[k] ? `${k}: ${n[k].value}${n[k].unit ?? ''} (${n[k].status ?? ''}, ideal ${n[k].ideal ?? ''})` : null;
      parts.push(`SOIL CONDITIONS (${soil.location?.state ?? state ?? 'region'}):
• Type: ${soil.soilProfile.type}, texture ${soil.soilProfile.texture}, fertility ${soil.soilProfile.fertility}, drainage ${soil.soilProfile.drainage}, water retention ${soil.soilProfile.waterRetention}
• Nutrients: ${Object.keys(n).map(fmt).filter(Boolean).join('; ')}`);
    }

    if (market?.crops?.length) {
      const farmerCrops = new Set<string>([
        ...(fields ?? []).map((f: any) => String(f.crop || '').toLowerCase()),
        ...(yields ?? []).map((y: any) => String(y.crop_type || '').toLowerCase()),
      ].filter(Boolean));
      const mentioned = market.crops.filter((c: any) => q.includes(c.name.toLowerCase()) || farmerCrops.has(c.name.toLowerCase()));
      const list = (mentioned.length ? mentioned : market.crops.slice(0, 20));
      parts.push(`LIVE MANDI PRICES (${market.location?.city ?? ''} ${market.location?.state ?? ''}, INR):\n` +
        list.map((c: any) => `• ${c.name} (${c.nameHindi}): ₹${c.price}/${c.unit}, ${c.change > 0 ? '+' : ''}${c.change}% ${c.trend}`).join('\n'));
    }

    if (wantsPest && weather?.current) {
      const t = Number(weather.current.temp), h = Number(weather.current.humidity);
      const risks: string[] = [];
      if (h >= 80 && t >= 20 && t <= 30) risks.push('HIGH risk of fungal disease (blight, blast, downy mildew) — high humidity with warm temperature');
      if (h >= 70 && t >= 25) risks.push('Moderate-high risk of leaf spot and bacterial blight');
      if (t >= 30 && h <= 50) risks.push('HIGH risk of sucking pests (aphids, whitefly, thrips, mites) — hot and dry');
      if (t >= 20 && t <= 32 && h >= 60) risks.push('Stem borer and bollworm activity likely');
      if (!risks.length) risks.push('Low overall pest pressure in current conditions, keep routine scouting');
      parts.push(`PEST & DISEASE RISK (derived from live weather):\n• ${risks.join('\n• ')}`);
    }

    const context = parts.length
      ? `\n\n===== REAL-TIME FARM DATA FOR THIS FARMER (use this, do not invent numbers) =====\n${parts.join('\n\n')}\n===== END DATA =====`
      : '\n\n(No farm data available for this user yet — ask them to enable GPS location and map their field in the app.)';

    const systemPrompt = `You are FarmBot AI, the in-app farming assistant for Agri Innovators, used by Indian farmers.

You have DIRECT ACCESS to this farmer's live app data below: GPS location, mapped fields with acreage and crop growth stages, live weather + alerts, soil conditions with nutrient values, live mandi prices, and derived pest/disease risk.

RULES:
• ALWAYS answer weather, soil, pest, disease, fertilizer and market-price questions using the REAL-TIME FARM DATA block. Quote the actual numbers (temperature, humidity, pH, N-P-K, ₹ prices).
• NEVER say you cannot access weather, soil, market or field data, and never tell the user to check another app or website — the data is right here.
• If a specific data section is missing, say exactly what is missing and tell them how to enable it in the app (allow GPS location / map a field in Soil Conditions).
• Tie advice to the farmer's own fields: acreage, crop and growth stage. Give quantities per acre where useful.
• Respond in the SAME LANGUAGE as the user's message (Hindi, Punjabi, Marathi, English, etc.).

FORMATTING:
• Use bullet points (•), short paragraphs (2-3 sentences), blank lines between sections.
• No markdown symbols like *, #, or backticks.
• Be practical, specific and encouraging.${context}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('AI configuration error');

    const gatewayResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.6-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: false,
      }),
    });

    if (!gatewayResp.ok) {
      const t = await gatewayResp.text();
      console.error('Lovable AI gateway error:', gatewayResp.status, t);
      if (gatewayResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (gatewayResp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please top up to continue.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const gatewayJson = await gatewayResp.json();
    let reply: string = gatewayJson.choices?.[0]?.message?.content ?? '';

    reply = reply
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return new Response(JSON.stringify({
      reply,
      dataUsed: {
        weather: !!weather?.current,
        soil: !!soil?.soilProfile,
        market: !!market?.crops?.length,
        fields: fields?.length ?? 0,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
