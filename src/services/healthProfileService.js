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
        },
        edibleParts: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["nutrients", "healthHints", "edibleParts"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Provide REAL scientific nutritional data for the specific species: ${scientificName} (${commonName}). 
        Identify the EXACT primary vitamins, minerals, and protein content found in this specific plant based on botanical and nutritional studies. 
        Do not provide generic nutritional ranges. If specific data is unknown for a compound, state 'Traces' or 'Moderate' rather than generic filler.
        Include 2 health benefits supported by ethnobotanical or clinical research.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Health Profile Service Error:", error);
      return null;
    }
  }
};