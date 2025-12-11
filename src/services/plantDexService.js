import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Robust API Key retrieval
let apiKey = '';
try {
  apiKey = process.env.API_KEY;
} catch (e) {
  // process not defined, ignore
}

// Fallback for Vite environments if process.env.API_KEY didn't work directly
if (!apiKey && import.meta && import.meta.env) {
  apiKey = import.meta.env.VITE_API_KEY;
}

const ai = new GoogleGenAI({ apiKey: apiKey });
const HISTORY_KEY = 'plantdex_history';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    if (!apiKey) {
      return { error: "Configuration Error: API Key is missing." };
    }

    const plantSchema = {
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
              edibleParts: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              toxicParts: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              funFact: { type: Type.STRING },
              videoContext: { type: Type.STRING }
            },
            required: ["scientificName", "commonName", "isEdible", "description"],
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
              { text: "Identify this plant. Even if dry, withered, or distant, provide the best possible identification. If it is a generic tree or shrub, identify the likely species. Do not fail. Return valid JSON." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: plantSchema,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ]
        },
      });

      const text = response.text || "{}";
      let data = {};
      try {
          data = JSON.parse(text);
      } catch (e) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) data = JSON.parse(jsonMatch[0]);
      }
      
      let plants = data.plants || [];

      if (plants.length > 0) {
        const topPlant = plants[0];
        plants = plants.map((p, idx) => ({ ...p, id: Date.now() + idx }));
        
        plantDexService.saveToHistory({
          name: topPlant.commonName || topPlant.scientificName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`
        });
      }

      return { plants };

    } catch (error) {
      console.error("AI Error:", error);
      return { error: error.message || "Unable to identify plant." };
    }
  },

  findSpecificRecipes: async (plantName) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 3 YouTube video titles/links for "${plantName}". Return JSON array [{title, channel, link, duration}].`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
      });
      const match = (response.text || "").match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    } catch (e) {
      return [];
    }
  },

  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (e) { return []; }
  },

  saveToHistory: (item) => {
    try {
      const history = plantDexService.getHistory();
      // Remove duplicates based on name to keep list fresh
      const filtered = history.filter(h => h.name !== item.name);
      const newHistory = [item, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) { console.error(e); }
  }
};
