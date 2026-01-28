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
            vitamins: { type: Type.STRING, description: "Detailed list of real vitamins found in this species." },
            minerals: { type: Type.STRING, description: "Specific minerals predominant in this plant." },
            proteins: { type: Type.STRING, description: "Detailed protein/amino acid profile." }
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
      // MANDATORY: Use gemini-3-pro-preview with googleSearch for TRUTHFUL data
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research the specific nutritional and biochemical profile of the plant ${scientificName} (${commonName}). 
        You MUST use Google Search to find real, specific nutritional values. 
        Avoid generic placeholders like "A, C, K" or "Rich in vitamins". 
        I need to know the specific predominant vitamins (e.g., B6, B12, specific carotenoids), the exact minerals (e.g., high manganese or potassium levels), and a detailed protein/amino acid description. 
        Identify safety-verified edible parts and exactly two therapeutic benefits supported by botanical science.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      });
      
      const text = response.text || "{}";
      // Ensure the text is clean JSON
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Critical: Truthful Data Retrieval Failed:", error);
      return null;
    }
  }
};