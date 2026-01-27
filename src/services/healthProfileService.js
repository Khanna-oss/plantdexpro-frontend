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
            vitamins: { type: Type.STRING, description: "Specific vitamins found in this exact species, e.g. B1, B6, C." },
            minerals: { type: Type.STRING, description: "Major minerals found in this species, e.g. Magnesium, Manganese." },
            proteins: { type: Type.STRING, description: "Actual protein content per 100g if known, or specific amino acids." }
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
      // Using Google Search to ground the data in reality rather than generic AI output
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research the specific nutritional facts for ${scientificName} (${commonName}). 
        I need TRUTHFUL, non-generic data. Do not just say 'A, C, K'. 
        If it contains specific alkaloids or rare nutrients, list them. 
        What is the actual protein level? Which specific minerals are predominant? 
        Ground your answer in real botanical studies found on the web.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      });
      
      const text = response.text || "{}";
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Truthful Data Fetch Error:", error);
      // Fallback to more direct prompt if grounding fails
      return null;
    }
  }
};