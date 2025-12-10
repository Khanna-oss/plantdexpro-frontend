import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const HISTORY_KEY = 'plantdex_history';

export const plantDexService = {
  /**
   * Identifies the plant using Gemini Vision.
   */
  identifyPlant: async (base64Image) => {
    const plantSchema = {
      type: Type.OBJECT,
      properties: {
        plants: {
          type: Type.ARRAY,
          description: "An array containing information about the identified plant(s).",
          items: {
            type: Type.OBJECT,
            properties: {
              scientificName: { type: Type.STRING, description: "The scientific name of the plant." },
              commonName: { type: Type.STRING, description: "The common name of the plant." },
              confidenceScore: { type: Type.NUMBER, description: "A confidence score between 0 and 1." },
              isEdible: { type: Type.BOOLEAN, description: "Is the plant edible?" },
              edibleParts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of edible parts."
              },
              description: { type: Type.STRING, description: "Brief description." },
              toxicParts: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              funFact: { type: Type.STRING, description: "A fun or interesting fact about the plant." },
              videoContext: { type: Type.STRING, description: "Either 'recipes' or 'uses' depending on edibility." }
            },
            required: ["scientificName", "commonName", "confidenceScore", "isEdible", "edibleParts", "description", "funFact", "videoContext"],
          }
        }
      },
      required: ["plants"],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              { text: "Analyze this plant image. Identify the plant. Provide scientific/common names, confidence, edibility details, safety warnings, description, and a fun fact." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: plantSchema,
        },
      });

      // Clean and parse JSON
      const text = response.text || "{}";
      const cleanText = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanText);
      
      let plants = data.plants || [];

      // Save top result to history
      if (plants.length > 0) {
        const topPlant = plants[0];
        // Generate a unique ID for React rendering
        plants = plants.map((p, idx) => ({ ...p, id: Date.now() + idx }));

        const historyItem = {
          name: topPlant.commonName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`
        };
        plantDexService.saveToHistory(historyItem);
      }

      return { plants };

    } catch (error) {
      console.error("Identification Error:", error);
      return { error: "Failed to identify plant. Please try again." };
    }
  },

  /**
   * Finds specific recipes or videos using Gemini Search Grounding.
   */
  findSpecificRecipes: async (plantName) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 3 high-quality YouTube video titles and URLs for "${plantName} recipes". Return a JSON array of objects with keys: title, channel, link, duration.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "[]";
      const cleanText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.warn("Recipe search failed, falling back to empty list", e);
      return [];
    }
  },

  getHistory: () => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveToHistory: (item) => {
    try {
      const history = plantDexService.getHistory();
      // Avoid duplicates at the top
      if (history.length > 0 && history[0].name === item.name) return;
      
      const newHistory = [item, ...history].slice(0, 10); // Keep last 10
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }
};