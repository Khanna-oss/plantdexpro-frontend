import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Access the API key injected by Vite.
const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const HISTORY_KEY = 'plantdex_history';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. Validate Key
    if (!API_KEY) {
      console.error("API Key is missing. Please check your .env file or Vercel settings.");
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
      // 2. Call Gemini Vision
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              { text: "Identify this plant. Even if it is dry, withered, or a distant tree, make your best guess. Do not return unknown. Return valid JSON." }
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

      // 3. Robust Parsing
      const text = response.text || "{}";
      let data = {};
      
      try {
          data = JSON.parse(text);
      } catch (e) {
          // Fallback regex to extract JSON if the model adds markdown formatting
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[0]);
            } catch (inner) {
              console.error("Failed to parse extracted JSON");
            }
          }
      }
      
      let plants = data.plants || [];

      // 4. Save to History
      if (plants.length > 0) {
        const topPlant = plants[0];
        // Add ID for React keys
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
      // Return the actual error message to the UI
      return { error: error.message || "Unable to identify plant." };
    }
  },

  findSpecificRecipes: async (plantName) => {
    try {
      // Use Google Search Grounding to find actual videos
      // Note: We do NOT set responseMimeType to JSON here because it conflicts with the tool
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 3 YouTube video titles and links for "${plantName} recipes" or "${plantName} uses". Return a JSON array of objects with keys: title, channel, link, duration. Format the output as a JSON string block.`,
        config: { 
          tools: [{ googleSearch: {} }] 
        }
      });
      
      const text = response.text || "";
      // Extract JSON array from the response text
      const match = text.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    } catch (e) {
      console.warn("Search failed", e);
      // Smart Fallback to clickable search links
      return [
         { 
           title: `Search: ${plantName} Recipes`, 
           channel: "YouTube Search", 
           link: `https://www.youtube.com/results?search_query=${encodeURIComponent(plantName)}+recipe`, 
           duration: "Link" 
         },
         { 
           title: `Search: ${plantName} Care Guide`, 
           channel: "YouTube Search", 
           link: `https://www.youtube.com/results?search_query=${encodeURIComponent(plantName)}+care`, 
           duration: "Link" 
         }
      ];
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
      const filtered = history.filter(h => h.name !== item.name);
      const newHistory = [item, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) { console.error(e); }
  }
};