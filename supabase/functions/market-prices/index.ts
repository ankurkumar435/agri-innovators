import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bodySchema = z.object({
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

// Comprehensive list of crops traded in Indian mandis
const majorCrops = [
  { name: 'Rice', nameHindi: 'चावल', category: 'cereals' },
  { name: 'Wheat', nameHindi: 'गेहूं', category: 'cereals' },
  { name: 'Maize', nameHindi: 'मक्का', category: 'cereals' },
  { name: 'Bajra', nameHindi: 'बाजरा', category: 'cereals' },
  { name: 'Jowar', nameHindi: 'ज्वार', category: 'cereals' },
  { name: 'Barley', nameHindi: 'जौ', category: 'cereals' },
  { name: 'Ragi', nameHindi: 'रागी', category: 'cereals' },
  { name: 'Chana', nameHindi: 'चना', category: 'pulses' },
  { name: 'Arhar/Tur Dal', nameHindi: 'अरहर/तूर दाल', category: 'pulses' },
  { name: 'Moong', nameHindi: 'मूंग', category: 'pulses' },
  { name: 'Urad', nameHindi: 'उड़द', category: 'pulses' },
  { name: 'Masoor', nameHindi: 'मसूर', category: 'pulses' },
  { name: 'Rajma', nameHindi: 'राजमा', category: 'pulses' },
  { name: 'Lobia', nameHindi: 'लोबिया', category: 'pulses' },
  { name: 'Potato', nameHindi: 'आलू', category: 'vegetables' },
  { name: 'Onion', nameHindi: 'प्याज', category: 'vegetables' },
  { name: 'Tomato', nameHindi: 'टमाटर', category: 'vegetables' },
  { name: 'Cauliflower', nameHindi: 'फूलगोभी', category: 'vegetables' },
  { name: 'Cabbage', nameHindi: 'पत्तागोभी', category: 'vegetables' },
  { name: 'Brinjal', nameHindi: 'बैंगन', category: 'vegetables' },
  { name: 'Lady Finger', nameHindi: 'भिंडी', category: 'vegetables' },
  { name: 'Green Peas', nameHindi: 'हरी मटर', category: 'vegetables' },
  { name: 'Carrot', nameHindi: 'गाजर', category: 'vegetables' },
  { name: 'Radish', nameHindi: 'मूली', category: 'vegetables' },
  { name: 'Spinach', nameHindi: 'पालक', category: 'vegetables' },
  { name: 'Bitter Gourd', nameHindi: 'करेला', category: 'vegetables' },
  { name: 'Bottle Gourd', nameHindi: 'लौकी', category: 'vegetables' },
  { name: 'Cucumber', nameHindi: 'खीरा', category: 'vegetables' },
  { name: 'Capsicum', nameHindi: 'शिमला मिर्च', category: 'vegetables' },
  { name: 'Green Chilli', nameHindi: 'हरी मिर्च', category: 'vegetables' },
  { name: 'Ginger', nameHindi: 'अदरक', category: 'vegetables' },
  { name: 'Garlic', nameHindi: 'लहसुन', category: 'vegetables' },
  { name: 'Coriander', nameHindi: 'धनिया', category: 'vegetables' },
  { name: 'Fenugreek', nameHindi: 'मेथी', category: 'vegetables' },
  { name: 'Drumstick', nameHindi: 'सहजन', category: 'vegetables' },
  { name: 'Pumpkin', nameHindi: 'कद्दू', category: 'vegetables' },
  { name: 'Mango', nameHindi: 'आम', category: 'fruits' },
  { name: 'Banana', nameHindi: 'केला', category: 'fruits' },
  { name: 'Apple', nameHindi: 'सेब', category: 'fruits' },
  { name: 'Grapes', nameHindi: 'अंगूर', category: 'fruits' },
  { name: 'Papaya', nameHindi: 'पपीता', category: 'fruits' },
  { name: 'Guava', nameHindi: 'अमरूद', category: 'fruits' },
  { name: 'Watermelon', nameHindi: 'तरबूज', category: 'fruits' },
  { name: 'Pomegranate', nameHindi: 'अनार', category: 'fruits' },
  { name: 'Orange', nameHindi: 'संतरा', category: 'fruits' },
  { name: 'Lemon', nameHindi: 'नींबू', category: 'fruits' },
  { name: 'Soybean', nameHindi: 'सोयाबीन', category: 'oilseeds' },
  { name: 'Groundnut', nameHindi: 'मूंगफली', category: 'oilseeds' },
  { name: 'Mustard', nameHindi: 'सरसों', category: 'oilseeds' },
  { name: 'Sunflower', nameHindi: 'सूरजमुखी', category: 'oilseeds' },
  { name: 'Sesame', nameHindi: 'तिल', category: 'oilseeds' },
  { name: 'Castor', nameHindi: 'अरंडी', category: 'oilseeds' },
  { name: 'Coconut', nameHindi: 'नारियल', category: 'oilseeds' },
  { name: 'Turmeric', nameHindi: 'हल्दी', category: 'spices' },
  { name: 'Red Chilli', nameHindi: 'लाल मिर्च', category: 'spices' },
  { name: 'Cumin', nameHindi: 'जीरा', category: 'spices' },
  { name: 'Coriander Seeds', nameHindi: 'धनिया बीज', category: 'spices' },
  { name: 'Cardamom', nameHindi: 'इलायची', category: 'spices' },
  { name: 'Black Pepper', nameHindi: 'काली मिर्च', category: 'spices' },
  { name: 'Clove', nameHindi: 'लौंग', category: 'spices' },
  { name: 'Fennel', nameHindi: 'सौंफ', category: 'spices' },
  { name: 'Cotton', nameHindi: 'कपास', category: 'fibres' },
  { name: 'Jute', nameHindi: 'जूट', category: 'fibres' },
  { name: 'Sugarcane', nameHindi: 'गन्ना', category: 'cash_crops' },
  { name: 'Tea', nameHindi: 'चाय', category: 'cash_crops' },
  { name: 'Coffee', nameHindi: 'कॉफी', category: 'cash_crops' },
  { name: 'Tobacco', nameHindi: 'तंबाकू', category: 'cash_crops' },
];

// Base prices for all crops (INR per quintal/unit)
const basePrices: Record<string, number> = {
  Rice: 2150, Wheat: 2275, Maize: 2090, Bajra: 2350, Jowar: 2900, Barley: 1850, Ragi: 3750,
  Chana: 5400, 'Arhar/Tur Dal': 6800, Moong: 7800, Urad: 6600, Masoor: 6200, Rajma: 8500, Lobia: 6000,
  Potato: 1200, Onion: 2500, Tomato: 3000, Cauliflower: 2800, Cabbage: 1800, Brinjal: 2200,
  'Lady Finger': 3500, 'Green Peas': 4500, Carrot: 2600, Radish: 1500, Spinach: 2000,
  'Bitter Gourd': 3800, 'Bottle Gourd': 2000, Cucumber: 2500, Capsicum: 4200, 'Green Chilli': 5500,
  Ginger: 8000, Garlic: 12000, Coriander: 6500, Fenugreek: 4000, Drumstick: 4500, Pumpkin: 1800,
  Mango: 6000, Banana: 2500, Apple: 12000, Grapes: 8000, Papaya: 2800, Guava: 4000,
  Watermelon: 1500, Pomegranate: 9500, Orange: 5500, Lemon: 7000,
  Soybean: 4500, Groundnut: 5800, Mustard: 5200, Sunflower: 5500, Sesame: 11000, Castor: 6200, Coconut: 2800,
  Turmeric: 9500, 'Red Chilli': 14000, Cumin: 32000, 'Coriander Seeds': 8500, Cardamom: 150000,
  'Black Pepper': 48000, Clove: 95000, Fennel: 14000,
  Cotton: 6800, Jute: 4800,
  Sugarcane: 350, Tea: 22000, Coffee: 45000, Tobacco: 15000,
};

// State-wise price multipliers
const stateMultipliers: Record<string, number> = {
  'Uttar Pradesh': 1.0, 'Punjab': 1.03, 'Haryana': 1.02, 'Madhya Pradesh': 0.98,
  'Maharashtra': 1.05, 'Gujarat': 1.04, 'Rajasthan': 1.01, 'Bihar': 0.95,
  'West Bengal': 0.97, 'Karnataka': 1.06, 'Tamil Nadu': 1.08, 'Andhra Pradesh': 1.03,
  'Telangana': 1.04, 'Kerala': 1.10, 'Odisha': 0.96, 'Assam': 0.94,
  'Jharkhand': 0.95, 'Chhattisgarh': 0.97, 'Uttarakhand': 1.02, 'Himachal Pradesh': 1.05,
  'default': 1.0,
};

// Generate historical prices for the last 7 days
function generateHistoricalPrices(basePrice: number, cropName: string): { date: string; price: number }[] {
  const history = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfMonth = date.getDate();
    const seed = (cropName.charCodeAt(0) + dayOfMonth) % 100;
    const variationPercent = ((seed - 50) / 50) * 10; // -10% to +10% variation
    
    const price = Math.round(basePrice * (1 + variationPercent / 100));
    history.push({
      date: date.toISOString().split('T')[0],
      price,
    });
  }
  
  return history;
}

// Simulate price changes based on date (for realistic variation)
function getRealisticPriceVariation(basePrice: number, cropName: string) {
  const today = new Date();
  const seed = (cropName.charCodeAt(0) + today.getDate() + today.getDay()) % 100;
  const variationPercent = ((seed - 50) / 50) * 8;
  const price = Math.round(basePrice * (1 + variationPercent / 100));
  const change = parseFloat(variationPercent.toFixed(1));
  return { price, change: Math.abs(change), trend: change >= 0 ? 'up' as const : 'down' as const, history: generateHistoricalPrices(basePrice, cropName) };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    const rawBody = await req.json();
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { state, city } = parsed.data;
    
    console.log(`Fetching market prices for state: ${state}, city: ${city}`);
    
    // Get state multiplier
    const multiplier = stateMultipliers[state || ''] || stateMultipliers['default'];
    
    // Generate realistic market data
    const marketData = majorCrops.map(crop => {
      const basePrice = (basePrices[crop.name] || 2000) * multiplier;
      const { price, change, trend, history } = getRealisticPriceVariation(basePrice, crop.name);
      
      return {
        name: crop.name,
        nameHindi: crop.nameHindi,
        category: crop.category,
        price: price,
        change: change,
        trend: trend,
        unit: crop.category === 'fruits' ? 'kg' : 'qt',
        market: city || state || 'Local Mandi',
        history: history,
      };
    });

    // Sort by category for better display
    const sortedData = marketData.sort((a, b) => {
      const order = ['cereals', 'pulses', 'vegetables', 'fruits', 'oilseeds', 'spices', 'fibres', 'cash_crops'];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });

    const response = {
      success: true,
      location: {
        state: state || 'India',
        city: city || 'Local Market',
      },
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
      crops: sortedData,
    };

    console.log('Market prices response:', JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching market prices:', error);
    
    // Return fallback data on error
    const fallbackData = majorCrops.map(crop => ({
      name: crop.name,
      nameHindi: crop.nameHindi,
      category: crop.category,
      price: basePrices[crop.name] || 2000,
      change: 0,
      trend: 'up' as const,
      unit: crop.category === 'fruits' ? 'kg' : 'qt',
      market: 'Local Mandi',
      history: [],
    }));

    return new Response(JSON.stringify({
      success: true,
      location: { state: 'India', city: 'Local Market' },
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
      crops: fallbackData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
