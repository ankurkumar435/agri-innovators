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
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing crop image with Lovable AI...');

    const systemPrompt = `You are an expert plant pathologist, botanist, and agricultural AI assistant. Analyze crop images to:
1. FIRST identify the plant/crop species
2. Then detect any diseases, pests, or health issues

Your response must be a valid JSON object with the following structure:
{
  "plantNameEnglish": "Common name of the plant in English (e.g., Rice, Wheat, Tomato, Mango)",
  "plantNameHindi": "Name of the plant in Hindi (e.g., धान, गेहूं, टमाटर, आम)",
  "scientificName": "Scientific/botanical name (e.g., Oryza sativa)",
  "disease": "Name of the disease or 'Healthy Crop' if no issues detected",
  "diseaseHindi": "Disease name in Hindi (e.g., पत्ती अंगमारी, स्वस्थ फसल)",
  "confidence": "High/Medium/Low",
  "severity": "Healthy/Mild/Moderate/Severe",
  "treatment": "Detailed treatment recommendations in English - clear numbered steps",
  "treatmentHindi": "Treatment recommendations in Hindi - clear numbered steps",
  "prevention": "Prevention measures for future in English - clear numbered steps",
  "preventionHindi": "Prevention measures in Hindi - clear numbered steps",
  "ttsTextEnglish": "A natural, conversational summary for text-to-speech in English. Start with plant identification, then health status, then key recommendations. Use clear sentences without abbreviations. Example: 'This is a tomato plant. The plant appears healthy with no visible diseases. To maintain good health, ensure regular watering and proper sunlight.'",
  "ttsTextHindi": "A natural, conversational summary for text-to-speech in Hindi. Same structure as English. Example: 'यह टमाटर का पौधा है। पौधा स्वस्थ दिखाई दे रहा है। अच्छे स्वास्थ्य के लिए नियमित पानी और उचित धूप सुनिश्चित करें।'"
}

IMPORTANT for TTS text:
- Write in a natural speaking style, as if explaining to a farmer
- Avoid technical jargon, use simple words
- Use complete sentences, no bullet points or numbers in TTS fields
- Keep it concise but informative (3-5 sentences)
- Don't use abbreviations like "N/A" - spell things out

Be specific and accurate in identifying the plant species. If you cannot identify the plant clearly, provide your best guess with lower confidence. If the image is not of a plant or crop, state that clearly.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image. First identify the plant/crop species with names in both English and Hindi, then diagnose any diseases and provide treatment recommendations. Return response in JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content ?? '';
    
    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
      // Fallback if AI doesn't return proper JSON
        analysis = {
          plantNameEnglish: "Unknown Plant",
          plantNameHindi: "अज्ञात पौधा",
          scientificName: "N/A",
          disease: "Analysis Unavailable",
          diseaseHindi: "विश्लेषण अनुपलब्ध",
          confidence: "Low",
          severity: "Unknown",
          treatment: aiResponse || "Unable to analyze the image. Please ensure it's a clear photo of a crop.",
          treatmentHindi: "छवि का विश्लेषण करने में असमर्थ। कृपया सुनिश्चित करें कि यह फसल की एक स्पष्ट तस्वीर है।",
          prevention: "Take clear, well-lit photos of affected plant parts for better analysis.",
          preventionHindi: "बेहतर विश्लेषण के लिए प्रभावित पौधे के हिस्सों की स्पष्ट, अच्छी रोशनी वाली तस्वीरें लें।",
          ttsTextEnglish: "I could not identify this plant clearly. Please try again with a clearer photo showing the plant leaves and any affected areas.",
          ttsTextHindi: "मैं इस पौधे को स्पष्ट रूप से पहचान नहीं पाया। कृपया पत्तियों और प्रभावित क्षेत्रों को दिखाते हुए एक स्पष्ट फोटो के साथ पुनः प्रयास करें।"
        };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysis = {
        plantNameEnglish: "Unknown Plant",
        plantNameHindi: "अज्ञात पौधा",
        scientificName: "N/A",
        disease: "Analysis Error",
        diseaseHindi: "विश्लेषण त्रुटि",
        confidence: "Low",
        severity: "Unknown",
        treatment: "The analysis could not be completed. Please try again with a clearer image.",
        treatmentHindi: "विश्लेषण पूरा नहीं हो सका। कृपया एक स्पष्ट छवि के साथ पुनः प्रयास करें।",
        prevention: "Ensure good lighting and focus on the affected area.",
        preventionHindi: "अच्छी रोशनी सुनिश्चित करें और प्रभावित क्षेत्र पर ध्यान दें।",
        ttsTextEnglish: "Sorry, the analysis could not be completed. Please try again with a clearer image of your crop.",
        ttsTextHindi: "क्षमा करें, विश्लेषण पूरा नहीं हो सका। कृपया अपनी फसल की एक स्पष्ट छवि के साथ पुनः प्रयास करें।"
      };
    }

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
