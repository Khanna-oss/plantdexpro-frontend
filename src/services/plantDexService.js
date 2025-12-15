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
      return { error: "System configuration error. Please contact support." };
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
              videoContext: { type: Type.STRING },
              specificUsage: { type: Type.STRING, description: "Precise, real instructions on how to use this specific plant (e.g. 'Boil leaves for 10 mins', 'Gel can be applied topically'). Do NOT provide generic advice." },
              // New fields for specific nutrition data
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  vitamins: { type: Type.STRING, description: "List of key vitamins (e.g., A, C, K) or 'N/A'" },
                  minerals: { type: Type.STRING, description: "List of key minerals (e.g., Iron, Calcium) or 'N/A'" },
                  proteins: { type: Type.STRING, description: "Protein content level or 'N/A'" }
                }
              },
              healthHints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: "Short benefit title (e.g., 'Skin Soothing')" },
                    desc: { type: Type.STRING, description: "1 sentence explaining the specific benefit for THIS plant." }
                  }
                }
              }
            },
            required: ["scientificName", "commonName", "isEdible", "description", "videoContext", "specificUsage"],
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
              { text: "Identify this plant with high accuracy. Provide scientific name, common name, and a detailed description. If edible, provide TRUE specific nutritional data and SPECIFIC usage instructions (culinary or medicinal). If toxic, explain why. Do not return generic filler text. Return valid JSON." }
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

      // 4. Save to History
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
    try {
      // STRICT PROMPT: Ask for DIRECT video links
      // We instruct the model to use the search tool to find real YouTube links.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Search for 3 popular YouTube videos about "${plantName} recipes" or "${plantName} care". 
        Extract the video title, channel name, and the DIRECT YouTube URL (must be youtube.com/watch?v=...).
        Return a JSON array of objects with keys: title, channel, link, duration.`,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "";
      // Try to parse JSON directly from the response
      let videos = [];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            videos = JSON.parse(jsonMatch[0]);
        } else {
            // Fallback: If model didn't return JSON, try to parse it manually if it returns a list
             videos = [];
        }
      } catch(e) {
        console.warn("JSON parse failed for videos", e);
      }

      // Filter for valid YouTube links
      const validVideos = videos.filter(v => v.link && v.link.includes('youtube.com/watch'));

      if (validVideos.length > 0) {
          return validVideos;
      }
      
      // If AI failed to give valid JSON links, we return a smart fallback
      // that at least looks better than a generic search link.
      return [
         { 
           title: `${plantName} Guide & Uses`, 
           channel: "YouTube", 
           link: `https://www.youtube.com/results?search_query=${encodeURIComponent(plantName)}+guide`, 
           duration: "Watch" 
         },
         {
            title: `How to use ${plantName}`, 
            channel: "YouTube", 
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(plantName)}+uses`, 
            duration: "Watch"
         }
      ];

    } catch (e) {
      console.warn("Search failed", e);
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