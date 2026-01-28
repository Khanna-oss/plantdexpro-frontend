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
            vitamins: { type: Type.STRING, description: "Detailed list of real vitamins found in this species. Avoid generic placeholders." },
            minerals: { type: Type.STRING, description: "Specific minerals predominant in this plant." },
            proteins: { type: Type.STRING, description: "Detailed protein/amino acid profile or numeric value if available." }
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
        },
        sourceConfidence: { type: Type.NUMBER },
        sources: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["nutrients", "healthHints", "edibleParts", "sourceConfidence"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research the specific nutritional and biochemical profile of the plant ${scientificName} (${commonName}). 
        You MUST use Google Search to find real, specific nutritional values. 
        Avoid generic placeholders like "Rich in vitamins" or "Contains various minerals". 
        Identify safety-verified edible parts and therapeutic benefits supported by botanical science.
        If data is not reliably known, return null for the nutrient fields.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      });
      
      const text = (response.text || "{}").trim();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanedText);
      
      // Basic hallucination check: if it just says generic stuff, reject
      if (data.nutrients?.vitamins?.toLowerCase().includes("analyzing") || 
          data.nutrients?.vitamins?.toLowerCase().includes("calculating")) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Critical: Truthful Data Retrieval Failed:", error);
      return null;
    }
  }
};