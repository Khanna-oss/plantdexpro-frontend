import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';

const IDENTIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING },
          commonName: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          isEdible: { type: Type.BOOLEAN },
          description: { type: Type.STRING },
          funFact: { type: Type.STRING },
          visualFeatures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                part: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
            },
          },
        },
        required: ['scientificName', 'commonName', 'isEdible', 'description', 'visualFeatures'],
      },
    },
  },
  required: ['plants'],
};

export const identifyPlantCandidates = async (base64Image) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return { error: 'Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in .env file.' };
  }

  const ai = new GoogleGenAI({ apiKey });
  const startedAt = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Identify this plant species from the image. Provide botanical details and morphological features.' },
        ],
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: IDENTIFICATION_SCHEMA,
        safetySettings: [{
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        }],
      },
    });

    const finishedAt = Date.now();
    const data = JSON.parse(response.text || '{}');

    return {
      plants: Array.isArray(data?.plants) ? data.plants : [],
      raw: data,
      modelName: 'Gemini 3 Flash',
      inferenceLatencyMs: finishedAt - startedAt,
      startedAt,
      finishedAt,
    };
  } catch (error) {
    console.error('Plant model inference failed:', error);
    return {
      error: 'Botanical identification failed. Please check your image clarity.',
      details: error?.message || 'Unknown inference error',
    };
  }
};

export const plantModelService = {
  identifyPlantCandidates,
};
