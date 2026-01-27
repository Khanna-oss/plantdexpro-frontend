import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const healthProfileService = {
  getProfile: async (commonName, scientificName, isEdible) => {
    if (!scientificName || !isEdible || !API_KEY) return null;
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const profileSchema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING },
            minerals: { type: Type.STRING },
            proteins: { type: Type.STRING }
          },
          required: ["vitamins", "minerals", "proteins"]
        },
        healthHints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              desc: { type: Type.STRING }
            }
          }
        }
      },
      required: ["nutrients", "healthHints"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Biochemical data for ${scientificName}. 
        Return VITAMINS (e.g. A, C, K), MINERALS (e.g. Iron, Calcium), and PROTEIN level.
        Also provide 2 key health benefits.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Nutrition Load Error:", error);
      return null;
    }
  }
};