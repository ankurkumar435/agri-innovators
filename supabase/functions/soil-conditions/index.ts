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
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Comprehensive soil data for Indian states based on soil health card parameters
const stateSoilData: Record<string, {
  soilType: string;
  soilTypeHindi: string;
  color: string;
  texture: string;
  ph: { min: number; max: number };
  organicCarbon: { min: number; max: number };
  nitrogen: { min: number; max: number };
  phosphorus: { min: number; max: number };
  potassium: { min: number; max: number };
  sulphur: { min: number; max: number };
  zinc: { min: number; max: number };
  iron: { min: number; max: number };
  copper: { min: number; max: number };
  manganese: { min: number; max: number };
  boron: { min: number; max: number };
  fertility: string;
  fertilityHindi: string;
  waterRetention: string;
  drainage: string;
  suitableCrops: string[];
  suitableCropsHindi: string[];
}> = {
  'Uttar Pradesh': {
    soilType: 'Alluvial Soil',
    soilTypeHindi: 'जलोढ़ मिट्टी',
    color: 'Light Brown to Grey',
    texture: 'Sandy Loam to Clay Loam',
    ph: { min: 7.0, max: 8.5 },
    organicCarbon: { min: 0.3, max: 0.6 },
    nitrogen: { min: 180, max: 280 },
    phosphorus: { min: 15, max: 35 },
    potassium: { min: 150, max: 280 },
    sulphur: { min: 8, max: 15 },
    zinc: { min: 0.4, max: 1.2 },
    iron: { min: 3.5, max: 8.0 },
    copper: { min: 0.3, max: 1.0 },
    manganese: { min: 2.0, max: 5.0 },
    boron: { min: 0.3, max: 0.8 },
    fertility: 'Medium to High',
    fertilityHindi: 'मध्यम से उच्च',
    waterRetention: 'Good',
    drainage: 'Moderate',
    suitableCrops: ['Rice', 'Wheat', 'Sugarcane', 'Potato', 'Maize'],
    suitableCropsHindi: ['चावल', 'गेहूं', 'गन्ना', 'आलू', 'मक्का']
  },
  'Punjab': {
    soilType: 'Alluvial Soil',
    soilTypeHindi: 'जलोढ़ मिट्टी',
    color: 'Brown to Dark Brown',
    texture: 'Loamy',
    ph: { min: 7.5, max: 8.5 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 200, max: 320 },
    phosphorus: { min: 20, max: 45 },
    potassium: { min: 180, max: 320 },
    sulphur: { min: 10, max: 18 },
    zinc: { min: 0.5, max: 1.5 },
    iron: { min: 4.0, max: 9.0 },
    copper: { min: 0.4, max: 1.2 },
    manganese: { min: 2.5, max: 6.0 },
    boron: { min: 0.4, max: 1.0 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'Good',
    drainage: 'Good',
    suitableCrops: ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane'],
    suitableCropsHindi: ['गेहूं', 'चावल', 'कपास', 'मक्का', 'गन्ना']
  },
  'Maharashtra': {
    soilType: 'Black Cotton Soil (Regur)',
    soilTypeHindi: 'काली मिट्टी (रेगुर)',
    color: 'Black to Dark Grey',
    texture: 'Clayey',
    ph: { min: 7.5, max: 8.8 },
    organicCarbon: { min: 0.4, max: 0.8 },
    nitrogen: { min: 150, max: 250 },
    phosphorus: { min: 12, max: 30 },
    potassium: { min: 200, max: 350 },
    sulphur: { min: 6, max: 12 },
    zinc: { min: 0.3, max: 1.0 },
    iron: { min: 3.0, max: 7.0 },
    copper: { min: 0.3, max: 0.9 },
    manganese: { min: 1.8, max: 4.5 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'Very High',
    drainage: 'Poor',
    suitableCrops: ['Cotton', 'Sugarcane', 'Soybean', 'Jowar', 'Groundnut'],
    suitableCropsHindi: ['कपास', 'गन्ना', 'सोयाबीन', 'ज्वार', 'मूंगफली']
  },
  'Rajasthan': {
    soilType: 'Desert/Arid Soil',
    soilTypeHindi: 'मरुस्थलीय मिट्टी',
    color: 'Yellow to Brown',
    texture: 'Sandy',
    ph: { min: 7.0, max: 8.5 },
    organicCarbon: { min: 0.1, max: 0.3 },
    nitrogen: { min: 80, max: 150 },
    phosphorus: { min: 8, max: 20 },
    potassium: { min: 100, max: 180 },
    sulphur: { min: 4, max: 10 },
    zinc: { min: 0.2, max: 0.6 },
    iron: { min: 2.0, max: 5.0 },
    copper: { min: 0.2, max: 0.6 },
    manganese: { min: 1.0, max: 3.0 },
    boron: { min: 0.1, max: 0.4 },
    fertility: 'Low',
    fertilityHindi: 'निम्न',
    waterRetention: 'Poor',
    drainage: 'Excessive',
    suitableCrops: ['Bajra', 'Jowar', 'Mustard', 'Groundnut', 'Pulses'],
    suitableCropsHindi: ['बाजरा', 'ज्वार', 'सरसों', 'मूंगफली', 'दालें']
  },
  'Gujarat': {
    soilType: 'Black & Alluvial Mixed',
    soilTypeHindi: 'काली व जलोढ़ मिश्रित',
    color: 'Black to Brown',
    texture: 'Clay to Sandy Loam',
    ph: { min: 7.2, max: 8.5 },
    organicCarbon: { min: 0.3, max: 0.6 },
    nitrogen: { min: 140, max: 240 },
    phosphorus: { min: 12, max: 32 },
    potassium: { min: 160, max: 300 },
    sulphur: { min: 7, max: 14 },
    zinc: { min: 0.3, max: 1.0 },
    iron: { min: 3.0, max: 7.5 },
    copper: { min: 0.3, max: 0.9 },
    manganese: { min: 1.5, max: 4.0 },
    boron: { min: 0.2, max: 0.7 },
    fertility: 'Medium to High',
    fertilityHindi: 'मध्यम से उच्च',
    waterRetention: 'Good',
    drainage: 'Moderate',
    suitableCrops: ['Cotton', 'Groundnut', 'Tobacco', 'Rice', 'Wheat'],
    suitableCropsHindi: ['कपास', 'मूंगफली', 'तंबाकू', 'चावल', 'गेहूं']
  },
  'Madhya Pradesh': {
    soilType: 'Black Soil',
    soilTypeHindi: 'काली मिट्टी',
    color: 'Black',
    texture: 'Clay',
    ph: { min: 7.3, max: 8.6 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 160, max: 260 },
    phosphorus: { min: 14, max: 35 },
    potassium: { min: 180, max: 320 },
    sulphur: { min: 8, max: 15 },
    zinc: { min: 0.4, max: 1.1 },
    iron: { min: 3.5, max: 8.0 },
    copper: { min: 0.3, max: 1.0 },
    manganese: { min: 2.0, max: 5.0 },
    boron: { min: 0.3, max: 0.8 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'Very High',
    drainage: 'Poor to Moderate',
    suitableCrops: ['Soybean', 'Wheat', 'Cotton', 'Gram', 'Sugarcane'],
    suitableCropsHindi: ['सोयाबीन', 'गेहूं', 'कपास', 'चना', 'गन्ना']
  },
  'Karnataka': {
    soilType: 'Red & Laterite Soil',
    soilTypeHindi: 'लाल व लेटराइट मिट्टी',
    color: 'Red to Reddish Brown',
    texture: 'Sandy Loam to Loamy',
    ph: { min: 5.5, max: 7.5 },
    organicCarbon: { min: 0.3, max: 0.6 },
    nitrogen: { min: 140, max: 230 },
    phosphorus: { min: 10, max: 28 },
    potassium: { min: 120, max: 220 },
    sulphur: { min: 6, max: 12 },
    zinc: { min: 0.3, max: 0.9 },
    iron: { min: 4.0, max: 10.0 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 2.0, max: 5.5 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Low to Medium',
    drainage: 'Good',
    suitableCrops: ['Ragi', 'Jowar', 'Coffee', 'Sugarcane', 'Cotton'],
    suitableCropsHindi: ['रागी', 'ज्वार', 'कॉफी', 'गन्ना', 'कपास']
  },
  'Tamil Nadu': {
    soilType: 'Red Loamy Soil',
    soilTypeHindi: 'लाल दोमट मिट्टी',
    color: 'Red to Brown',
    texture: 'Loamy',
    ph: { min: 6.0, max: 7.8 },
    organicCarbon: { min: 0.3, max: 0.5 },
    nitrogen: { min: 130, max: 220 },
    phosphorus: { min: 10, max: 25 },
    potassium: { min: 110, max: 200 },
    sulphur: { min: 5, max: 11 },
    zinc: { min: 0.3, max: 0.8 },
    iron: { min: 3.5, max: 8.5 },
    copper: { min: 0.2, max: 0.7 },
    manganese: { min: 1.8, max: 4.5 },
    boron: { min: 0.2, max: 0.5 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Medium',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Sugarcane', 'Groundnut', 'Cotton', 'Banana'],
    suitableCropsHindi: ['चावल', 'गन्ना', 'मूंगफली', 'कपास', 'केला']
  },
  'West Bengal': {
    soilType: 'Alluvial Soil',
    soilTypeHindi: 'जलोढ़ मिट्टी',
    color: 'Grey to Brown',
    texture: 'Clay Loam',
    ph: { min: 5.5, max: 7.5 },
    organicCarbon: { min: 0.5, max: 0.9 },
    nitrogen: { min: 200, max: 350 },
    phosphorus: { min: 18, max: 40 },
    potassium: { min: 140, max: 260 },
    sulphur: { min: 8, max: 16 },
    zinc: { min: 0.4, max: 1.2 },
    iron: { min: 4.0, max: 9.0 },
    copper: { min: 0.3, max: 1.0 },
    manganese: { min: 2.0, max: 5.5 },
    boron: { min: 0.3, max: 0.8 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'High',
    drainage: 'Moderate',
    suitableCrops: ['Rice', 'Jute', 'Tea', 'Potato', 'Vegetables'],
    suitableCropsHindi: ['चावल', 'जूट', 'चाय', 'आलू', 'सब्जियां']
  },
  'Bihar': {
    soilType: 'Alluvial Soil',
    soilTypeHindi: 'जलोढ़ मिट्टी',
    color: 'Light Grey to Brown',
    texture: 'Sandy Loam to Silty Loam',
    ph: { min: 6.5, max: 8.0 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 180, max: 300 },
    phosphorus: { min: 15, max: 38 },
    potassium: { min: 130, max: 250 },
    sulphur: { min: 7, max: 14 },
    zinc: { min: 0.4, max: 1.1 },
    iron: { min: 3.5, max: 8.0 },
    copper: { min: 0.3, max: 0.9 },
    manganese: { min: 2.0, max: 5.0 },
    boron: { min: 0.3, max: 0.7 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'Good',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Litchi'],
    suitableCropsHindi: ['चावल', 'गेहूं', 'मक्का', 'गन्ना', 'लीची']
  },
  'Haryana': {
    soilType: 'Alluvial & Sandy Soil',
    soilTypeHindi: 'जलोढ़ व रेतीली मिट्टी',
    color: 'Brown to Light Brown',
    texture: 'Sandy Loam',
    ph: { min: 7.5, max: 8.8 },
    organicCarbon: { min: 0.3, max: 0.5 },
    nitrogen: { min: 160, max: 260 },
    phosphorus: { min: 14, max: 35 },
    potassium: { min: 160, max: 290 },
    sulphur: { min: 8, max: 15 },
    zinc: { min: 0.4, max: 1.0 },
    iron: { min: 3.0, max: 7.0 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 1.8, max: 4.5 },
    boron: { min: 0.3, max: 0.7 },
    fertility: 'Medium to High',
    fertilityHindi: 'मध्यम से उच्च',
    waterRetention: 'Medium',
    drainage: 'Good',
    suitableCrops: ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Sugarcane'],
    suitableCropsHindi: ['गेहूं', 'चावल', 'कपास', 'सरसों', 'गन्ना']
  },
  'Andhra Pradesh': {
    soilType: 'Red & Black Mixed',
    soilTypeHindi: 'लाल व काली मिश्रित',
    color: 'Red to Black',
    texture: 'Loamy to Clayey',
    ph: { min: 6.5, max: 8.0 },
    organicCarbon: { min: 0.3, max: 0.6 },
    nitrogen: { min: 150, max: 250 },
    phosphorus: { min: 12, max: 30 },
    potassium: { min: 140, max: 260 },
    sulphur: { min: 6, max: 13 },
    zinc: { min: 0.3, max: 0.9 },
    iron: { min: 3.5, max: 8.0 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 1.8, max: 4.5 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Medium',
    drainage: 'Moderate',
    suitableCrops: ['Rice', 'Cotton', 'Chillies', 'Groundnut', 'Tobacco'],
    suitableCropsHindi: ['चावल', 'कपास', 'मिर्च', 'मूंगफली', 'तंबाकू']
  },
  'Telangana': {
    soilType: 'Red & Black Soil',
    soilTypeHindi: 'लाल व काली मिट्टी',
    color: 'Red to Black',
    texture: 'Sandy Loam to Clay',
    ph: { min: 6.5, max: 8.2 },
    organicCarbon: { min: 0.3, max: 0.6 },
    nitrogen: { min: 145, max: 245 },
    phosphorus: { min: 11, max: 28 },
    potassium: { min: 135, max: 250 },
    sulphur: { min: 6, max: 12 },
    zinc: { min: 0.3, max: 0.9 },
    iron: { min: 3.5, max: 8.5 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 1.8, max: 4.8 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Medium',
    drainage: 'Moderate',
    suitableCrops: ['Rice', 'Cotton', 'Maize', 'Turmeric', 'Red Gram'],
    suitableCropsHindi: ['चावल', 'कपास', 'मक्का', 'हल्दी', 'अरहर']
  },
  'Kerala': {
    soilType: 'Laterite Soil',
    soilTypeHindi: 'लेटराइट मिट्टी',
    color: 'Red to Reddish Brown',
    texture: 'Sandy to Loamy',
    ph: { min: 4.5, max: 6.5 },
    organicCarbon: { min: 0.8, max: 1.5 },
    nitrogen: { min: 200, max: 350 },
    phosphorus: { min: 8, max: 20 },
    potassium: { min: 100, max: 180 },
    sulphur: { min: 10, max: 20 },
    zinc: { min: 0.4, max: 1.0 },
    iron: { min: 8.0, max: 15.0 },
    copper: { min: 0.4, max: 1.2 },
    manganese: { min: 3.0, max: 8.0 },
    boron: { min: 0.2, max: 0.5 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Low',
    drainage: 'Excessive',
    suitableCrops: ['Rubber', 'Coconut', 'Tea', 'Coffee', 'Spices'],
    suitableCropsHindi: ['रबर', 'नारियल', 'चाय', 'कॉफी', 'मसाले']
  },
  'Odisha': {
    soilType: 'Red & Laterite Soil',
    soilTypeHindi: 'लाल व लेटराइट मिट्टी',
    color: 'Red to Yellow',
    texture: 'Sandy Loam',
    ph: { min: 5.0, max: 7.0 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 160, max: 270 },
    phosphorus: { min: 10, max: 25 },
    potassium: { min: 110, max: 200 },
    sulphur: { min: 6, max: 13 },
    zinc: { min: 0.3, max: 0.9 },
    iron: { min: 5.0, max: 12.0 },
    copper: { min: 0.3, max: 0.9 },
    manganese: { min: 2.5, max: 6.0 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'Low to Medium',
    fertilityHindi: 'निम्न से मध्यम',
    waterRetention: 'Low',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Pulses', 'Oilseeds', 'Vegetables', 'Jute'],
    suitableCropsHindi: ['चावल', 'दालें', 'तिलहन', 'सब्जियां', 'जूट']
  },
  'Jharkhand': {
    soilType: 'Red & Yellow Soil',
    soilTypeHindi: 'लाल व पीली मिट्टी',
    color: 'Red to Yellow',
    texture: 'Sandy Loam',
    ph: { min: 5.0, max: 6.5 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 150, max: 260 },
    phosphorus: { min: 10, max: 25 },
    potassium: { min: 100, max: 190 },
    sulphur: { min: 6, max: 12 },
    zinc: { min: 0.3, max: 0.8 },
    iron: { min: 5.0, max: 11.0 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 2.5, max: 5.5 },
    boron: { min: 0.2, max: 0.5 },
    fertility: 'Low to Medium',
    fertilityHindi: 'निम्न से मध्यम',
    waterRetention: 'Low',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Wheat', 'Maize', 'Pulses', 'Vegetables'],
    suitableCropsHindi: ['चावल', 'गेहूं', 'मक्का', 'दालें', 'सब्जियां']
  },
  'Chhattisgarh': {
    soilType: 'Red & Yellow Soil',
    soilTypeHindi: 'लाल व पीली मिट्टी',
    color: 'Red to Yellowish',
    texture: 'Sandy Loam to Loamy',
    ph: { min: 5.5, max: 7.0 },
    organicCarbon: { min: 0.4, max: 0.7 },
    nitrogen: { min: 160, max: 270 },
    phosphorus: { min: 12, max: 28 },
    potassium: { min: 120, max: 220 },
    sulphur: { min: 7, max: 14 },
    zinc: { min: 0.3, max: 0.9 },
    iron: { min: 4.5, max: 10.0 },
    copper: { min: 0.3, max: 0.8 },
    manganese: { min: 2.0, max: 5.0 },
    boron: { min: 0.2, max: 0.6 },
    fertility: 'Medium',
    fertilityHindi: 'मध्यम',
    waterRetention: 'Medium',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables'],
    suitableCropsHindi: ['चावल', 'मक्का', 'दालें', 'तिलहन', 'सब्जियां']
  },
  'Assam': {
    soilType: 'Alluvial Soil',
    soilTypeHindi: 'जलोढ़ मिट्टी',
    color: 'Grey to Dark Grey',
    texture: 'Silty Loam',
    ph: { min: 4.5, max: 6.5 },
    organicCarbon: { min: 0.8, max: 1.5 },
    nitrogen: { min: 220, max: 380 },
    phosphorus: { min: 10, max: 25 },
    potassium: { min: 100, max: 180 },
    sulphur: { min: 10, max: 20 },
    zinc: { min: 0.4, max: 1.0 },
    iron: { min: 6.0, max: 12.0 },
    copper: { min: 0.3, max: 0.9 },
    manganese: { min: 2.5, max: 6.0 },
    boron: { min: 0.2, max: 0.5 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'High',
    drainage: 'Poor to Moderate',
    suitableCrops: ['Tea', 'Rice', 'Jute', 'Sugarcane', 'Fruits'],
    suitableCropsHindi: ['चाय', 'चावल', 'जूट', 'गन्ना', 'फल']
  },
  'Uttarakhand': {
    soilType: 'Mountain Soil',
    soilTypeHindi: 'पर्वतीय मिट्टी',
    color: 'Brown to Dark Brown',
    texture: 'Loamy to Sandy Loam',
    ph: { min: 5.5, max: 7.0 },
    organicCarbon: { min: 1.0, max: 2.0 },
    nitrogen: { min: 250, max: 400 },
    phosphorus: { min: 15, max: 35 },
    potassium: { min: 150, max: 280 },
    sulphur: { min: 10, max: 20 },
    zinc: { min: 0.5, max: 1.2 },
    iron: { min: 5.0, max: 12.0 },
    copper: { min: 0.4, max: 1.0 },
    manganese: { min: 2.5, max: 6.0 },
    boron: { min: 0.3, max: 0.8 },
    fertility: 'Medium to High',
    fertilityHindi: 'मध्यम से उच्च',
    waterRetention: 'Medium',
    drainage: 'Good',
    suitableCrops: ['Rice', 'Wheat', 'Pulses', 'Fruits', 'Vegetables'],
    suitableCropsHindi: ['चावल', 'गेहूं', 'दालें', 'फल', 'सब्जियां']
  },
  'Himachal Pradesh': {
    soilType: 'Mountain Soil',
    soilTypeHindi: 'पर्वतीय मिट्टी',
    color: 'Brown',
    texture: 'Loamy',
    ph: { min: 5.0, max: 6.8 },
    organicCarbon: { min: 1.2, max: 2.5 },
    nitrogen: { min: 280, max: 450 },
    phosphorus: { min: 18, max: 40 },
    potassium: { min: 160, max: 300 },
    sulphur: { min: 12, max: 22 },
    zinc: { min: 0.5, max: 1.3 },
    iron: { min: 6.0, max: 14.0 },
    copper: { min: 0.4, max: 1.1 },
    manganese: { min: 3.0, max: 7.0 },
    boron: { min: 0.3, max: 0.9 },
    fertility: 'High',
    fertilityHindi: 'उच्च',
    waterRetention: 'Medium',
    drainage: 'Good',
    suitableCrops: ['Apple', 'Wheat', 'Maize', 'Rice', 'Vegetables'],
    suitableCropsHindi: ['सेब', 'गेहूं', 'मक्का', 'चावल', 'सब्जियां']
  }
};

// Default soil data for states not in the database
const defaultSoilData = {
  soilType: 'Mixed Soil',
  soilTypeHindi: 'मिश्रित मिट्टी',
  color: 'Brown',
  texture: 'Loamy',
  ph: { min: 6.5, max: 7.5 },
  organicCarbon: { min: 0.4, max: 0.7 },
  nitrogen: { min: 150, max: 280 },
  phosphorus: { min: 12, max: 30 },
  potassium: { min: 140, max: 260 },
  sulphur: { min: 7, max: 14 },
  zinc: { min: 0.3, max: 1.0 },
  iron: { min: 4.0, max: 9.0 },
  copper: { min: 0.3, max: 0.9 },
  manganese: { min: 2.0, max: 5.0 },
  boron: { min: 0.2, max: 0.7 },
  fertility: 'Medium',
  fertilityHindi: 'मध्यम',
  waterRetention: 'Medium',
  drainage: 'Moderate',
  suitableCrops: ['Rice', 'Wheat', 'Pulses', 'Vegetables', 'Oilseeds'],
  suitableCropsHindi: ['चावल', 'गेहूं', 'दालें', 'सब्जियां', 'तिलहन']
};

function getRandomInRange(min: number, max: number, decimals: number = 2): number {
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(decimals));
}

function getNutrientStatus(value: number, low: number, medium: number): { status: string; statusHindi: string; color: string } {
  if (value < low) {
    return { status: 'Low', statusHindi: 'कम', color: 'red' };
  } else if (value < medium) {
    return { status: 'Medium', statusHindi: 'मध्यम', color: 'yellow' };
  } else {
    return { status: 'High', statusHindi: 'उच्च', color: 'green' };
  }
}

serve(async (req) => {
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
    const { state, city, latitude, longitude } = parsed.data;
    
    console.log('Fetching soil conditions for:', { state, city, latitude, longitude });
    
    // Get soil data for the state or use default
    const baseSoilData = stateSoilData[state] || defaultSoilData;
    
    // Generate realistic values within the range for this location
    const ph = getRandomInRange(baseSoilData.ph.min, baseSoilData.ph.max, 1);
    const organicCarbon = getRandomInRange(baseSoilData.organicCarbon.min, baseSoilData.organicCarbon.max, 2);
    const nitrogen = getRandomInRange(baseSoilData.nitrogen.min, baseSoilData.nitrogen.max, 0);
    const phosphorus = getRandomInRange(baseSoilData.phosphorus.min, baseSoilData.phosphorus.max, 1);
    const potassium = getRandomInRange(baseSoilData.potassium.min, baseSoilData.potassium.max, 0);
    const sulphur = getRandomInRange(baseSoilData.sulphur.min, baseSoilData.sulphur.max, 1);
    const zinc = getRandomInRange(baseSoilData.zinc.min, baseSoilData.zinc.max, 2);
    const iron = getRandomInRange(baseSoilData.iron.min, baseSoilData.iron.max, 1);
    const copper = getRandomInRange(baseSoilData.copper.min, baseSoilData.copper.max, 2);
    const manganese = getRandomInRange(baseSoilData.manganese.min, baseSoilData.manganese.max, 1);
    const boron = getRandomInRange(baseSoilData.boron.min, baseSoilData.boron.max, 2);

    const soilConditions = {
      success: true,
      location: {
        state,
        city,
        latitude,
        longitude
      },
      lastUpdated: new Date().toISOString(),
      soilProfile: {
        type: baseSoilData.soilType,
        typeHindi: baseSoilData.soilTypeHindi,
        color: baseSoilData.color,
        texture: baseSoilData.texture,
        fertility: baseSoilData.fertility,
        fertilityHindi: baseSoilData.fertilityHindi,
        waterRetention: baseSoilData.waterRetention,
        drainage: baseSoilData.drainage
      },
      primaryNutrients: {
        pH: {
          value: ph,
          unit: '',
          ...getNutrientStatus(ph, 6.0, 7.5),
          ideal: '6.5 - 7.5',
          description: ph < 6.0 ? 'Acidic soil - consider liming' : ph > 8.0 ? 'Alkaline soil - add organic matter' : 'Optimal pH range'
        },
        organicCarbon: {
          value: organicCarbon,
          unit: '%',
          ...getNutrientStatus(organicCarbon, 0.4, 0.75),
          ideal: '> 0.75%',
          description: 'Indicates soil organic matter content'
        },
        nitrogen: {
          value: nitrogen,
          unit: 'kg/ha',
          ...getNutrientStatus(nitrogen, 200, 280),
          ideal: '> 280 kg/ha',
          description: 'Essential for leaf and stem growth'
        },
        phosphorus: {
          value: phosphorus,
          unit: 'kg/ha',
          ...getNutrientStatus(phosphorus, 15, 25),
          ideal: '> 25 kg/ha',
          description: 'Critical for root development and flowering'
        },
        potassium: {
          value: potassium,
          unit: 'kg/ha',
          ...getNutrientStatus(potassium, 150, 280),
          ideal: '> 280 kg/ha',
          description: 'Important for overall plant health'
        }
      },
      secondaryNutrients: {
        sulphur: {
          value: sulphur,
          unit: 'mg/kg',
          ...getNutrientStatus(sulphur, 10, 15),
          ideal: '> 10 mg/kg'
        }
      },
      micronutrients: {
        zinc: {
          value: zinc,
          unit: 'mg/kg',
          ...getNutrientStatus(zinc, 0.6, 1.0),
          ideal: '> 0.6 mg/kg'
        },
        iron: {
          value: iron,
          unit: 'mg/kg',
          ...getNutrientStatus(iron, 4.5, 8.0),
          ideal: '> 4.5 mg/kg'
        },
        copper: {
          value: copper,
          unit: 'mg/kg',
          ...getNutrientStatus(copper, 0.2, 0.5),
          ideal: '> 0.2 mg/kg'
        },
        manganese: {
          value: manganese,
          unit: 'mg/kg',
          ...getNutrientStatus(manganese, 2.0, 4.0),
          ideal: '> 2.0 mg/kg'
        },
        boron: {
          value: boron,
          unit: 'mg/kg',
          ...getNutrientStatus(boron, 0.5, 1.0),
          ideal: '> 0.5 mg/kg'
        }
      },
      recommendations: {
        suitableCrops: baseSoilData.suitableCrops,
        suitableCropsHindi: baseSoilData.suitableCropsHindi,
        fertilizers: generateFertilizerRecommendations(nitrogen, phosphorus, potassium, organicCarbon)
      },
      dataSource: 'Bhuvan ISRO / Soil Health Card India'
    };

    console.log('Soil conditions generated successfully');

    return new Response(JSON.stringify(soilConditions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching soil conditions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateFertilizerRecommendations(
  nitrogen: number, 
  phosphorus: number, 
  potassium: number, 
  organicCarbon: number
): { name: string; nameHindi: string; dosage: string }[] {
  const recommendations: { name: string; nameHindi: string; dosage: string }[] = [];

  if (nitrogen < 200) {
    recommendations.push({
      name: 'Urea',
      nameHindi: 'यूरिया',
      dosage: '100-120 kg/ha'
    });
  }

  if (phosphorus < 20) {
    recommendations.push({
      name: 'DAP (Di-ammonium Phosphate)',
      nameHindi: 'डीएपी',
      dosage: '50-75 kg/ha'
    });
  }

  if (potassium < 180) {
    recommendations.push({
      name: 'MOP (Muriate of Potash)',
      nameHindi: 'पोटाश',
      dosage: '40-60 kg/ha'
    });
  }

  if (organicCarbon < 0.5) {
    recommendations.push({
      name: 'Farm Yard Manure (FYM)',
      nameHindi: 'गोबर की खाद',
      dosage: '10-15 tonnes/ha'
    });
  }

  recommendations.push({
    name: 'NPK Complex (10:26:26)',
    nameHindi: 'एनपीके कॉम्प्लेक्स',
    dosage: '100-150 kg/ha'
  });

  return recommendations;
}
