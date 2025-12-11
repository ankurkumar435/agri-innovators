import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, crops, weather } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentSeason = getSeason();

    const systemPrompt = `You are an expert agricultural advisor for Indian farmers. Generate personalized farming recommendations based on the provided data.

IMPORTANT RULES:
- Provide exactly 4-5 actionable recommendations
- Each recommendation must be bilingual (English + Hindi)
- Consider current season (${currentSeason}), month (${currentMonth}), location, and crops
- Categories: Weather Alert, Crop Management, Pest Control, Market Insight, Soil Health
- Priorities: high (urgent action needed), medium (plan this week), low (general advice)
- Keep descriptions concise but practical

Return ONLY valid JSON array with this exact structure:
[
  {
    "category": "Category Name",
    "categoryHindi": "श्रेणी नाम",
    "title": "Short Title",
    "titleHindi": "शीर्षक",
    "description": "Detailed actionable advice in 1-2 sentences.",
    "descriptionHindi": "विस्तृत सलाह।",
    "priority": "high|medium|low",
    "icon": "leaf|trending|cloud|bug"
  }
]`;

    const userPrompt = `Generate farming recommendations for:
- Location: ${location?.city || 'India'}, ${location?.region || ''}
- Coordinates: ${location?.latitude || 'N/A'}, ${location?.longitude || 'N/A'}
- Current crops: ${crops?.length > 0 ? crops.join(', ') : 'Not specified'}
- Weather: ${weather ? `${weather.temperature}°C, ${weather.condition}` : 'Not available'}
- Current month: ${currentMonth}
- Season: ${currentSeason}

Provide practical, location-specific recommendations considering local climate and market conditions.`;

    console.log('Generating AI recommendations for:', { location: location?.city, crops, currentMonth });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response:', content);

    // Parse JSON from response
    let recommendations = [];
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      recommendations = getDefaultRecommendations(currentSeason);
    }

    // Validate and sanitize recommendations
    recommendations = recommendations.map((rec: any) => ({
      category: rec.category || 'General',
      categoryHindi: rec.categoryHindi || 'सामान्य',
      title: rec.title || 'Recommendation',
      titleHindi: rec.titleHindi || 'सिफारिश',
      description: rec.description || '',
      descriptionHindi: rec.descriptionHindi || '',
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
      icon: ['leaf', 'trending', 'cloud', 'bug'].includes(rec.icon) ? rec.icon : 'leaf'
    }));

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      recommendations: getDefaultRecommendations(getSeason())
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return 'Summer (Zaid)';
  if (month >= 6 && month <= 9) return 'Monsoon (Kharif)';
  return 'Winter (Rabi)';
}

function getDefaultRecommendations(season: string) {
  return [
    {
      category: 'Soil Health',
      categoryHindi: 'मिट्टी स्वास्थ्य',
      title: 'Soil Testing Recommended',
      titleHindi: 'मिट्टी परीक्षण की सिफारिश',
      description: 'Get your soil tested this season to optimize fertilizer usage and improve crop yield.',
      descriptionHindi: 'उर्वरक उपयोग अनुकूलित करने के लिए इस मौसम में मिट्टी का परीक्षण करवाएं।',
      priority: 'medium',
      icon: 'leaf'
    },
    {
      category: 'Pest Control',
      categoryHindi: 'कीट नियंत्रण',
      title: 'Regular Crop Monitoring',
      titleHindi: 'नियमित फसल निगरानी',
      description: 'Inspect your crops weekly for early pest detection and prevent major losses.',
      descriptionHindi: 'कीट का जल्दी पता लगाने के लिए साप्ताहिक फसलों का निरीक्षण करें।',
      priority: 'medium',
      icon: 'bug'
    }
  ];
}
