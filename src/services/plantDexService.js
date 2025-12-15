import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { healthProfileService } from "./healthProfileService";
import { videoRecommendationService } from "./videoRecommendationService";

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
      return { error: "System configuration error. Please contact support." };
    }

    // SIMPLIFIED SCHEMA: We rely on the specialized service for deep details now,
    // reducing the load on the vision model and preventing hallucinations.
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
              videoContext: { type: Type.STRING },
              // We keep these optional in the vision schema; if they come back empty, we fill them later.
              specificUsage: { type: Type.STRING, description: "Brief usage instructions." },
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  vitamins: { type: Type.STRING },
                  minerals: { type: Type.STRING },
                  proteins: { type: Type.STRING }
                }
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
            required: ["scientificName", "commonName", "isEdible", "description", "videoContext"],
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
              { text: "Identify this plant with high accuracy. Provide scientific name, common name, and a detailed description. If edible, provide nutritional data (vitamins, minerals) and specific usage. If toxic, explain why. Return valid JSON." }
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

      // 4. ENHANCE DATA WITH HEALTH PROFILE SERVICE
      // This is the new backend logic extension:
      if (plants.length > 0) {
        // Process the primary result
        const p = plants[0];
        if (p.isEdible && p.scientificName) {
           // Fetch deep health profile
           const richProfile = await healthProfileService.getProfile(p.commonName, p.scientificName, true);
           if (richProfile) {
             // Merge/Overwrite with high-quality text data
             p.nutrients = richProfile.nutrients || p.nutrients;
             p.healthHints = richProfile.healthHints || p.healthHints;
             p.specificUsage = richProfile.specificUsage || p.specificUsage;
           }
        }
        
        // Add ID for React keys
        plants = plants.map((pl, idx) => ({ ...pl, id: Date.now() + idx }));

        // Save to history
        plantDexService.saveToHistory({
          name: p.commonName || p.scientificName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`
        });
      }

      return { plants };

    } catch (error) {
      console.error("AI Error:", error);
      
      // FRIENDLY ERROR MAPPING
      let userMessage = "Unable to identify plant. Please check your connection and try again.";
      const errString = (error.message || error.toString()).toLowerCase();
      
      if (errString.includes("429") || errString.includes("quota") || errString.includes("exhausted") || errString.includes("limit")) {
        userMessage = "Today's plant finding limit has been reached. Please try again tomorrow!";
      } else if (errString.includes("safety") || errString.includes("blocked")) {
        userMessage = "This image was flagged by our safety filters. Please try a different image.";
      } else if (errString.includes("503") || errString.includes("overloaded")) {
         userMessage = "AI services are currently busy. Please try again in a moment.";
      } else if (errString.includes("key") || errString.includes("auth")) {
          userMessage = "Service configuration error. Please contact the administrator.";
      }

      return { error: userMessage };
    }
  },

  findSpecificRecipes: async (plantName) => {
    // Delegating to the new Video Recommendation Service
    // This allows for caching and smarter context handling
    try {
        // We guess context based on a generic 'recipes' assumption here, 
        // but in a fuller implementation we might pass isEdible from the component.
        // For now, defaulting to 'recipes' (which the service handles gracefully if user searches for non-edible)
        return await videoRecommendationService.getRecommendedVideos(plantName, 'recipes');
    } catch (e) {
        console.warn("Video fetch failed", e);
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
      const filtered = history.filter(h => h.name !== item.name);
      const newHistory = [item, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) { console.error(e); }
  }
};