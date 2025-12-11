import Groq from "groq-sdk";

// Access the API key injected by Vite.
const API_KEY = process.env.GROQ_API_KEY || '';

// Initialize Groq Client
// dangerouslyAllowBrowser: true is required for client-side usage in Vite
const groq = new Groq({ 
  apiKey: API_KEY, 
  dangerouslyAllowBrowser: true 
});

const HISTORY_KEY = 'plantdex_history';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. Validate Key
    if (!API_KEY) {
      console.error("Groq API Key is missing. Please check your .env file or Vercel settings.");
      return { error: "Configuration Error: Groq API Key is missing." };
    }

    try {
      // 2. Call Groq LLaMA Vision
      // We explicitly ask for the JSON structure required by the frontend
      const completion = await groq.chat.completions.create({
        model: "llama-3.2-90b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Identify this plant. Even if it is dry, withered, or a distant tree, make your best guess. 
                Return a valid JSON object with the following structure:
                {
                  "plants": [
                    {
                      "scientificName": "string",
                      "commonName": "string",
                      "confidenceScore": number (0-1),
                      "isEdible": boolean,
                      "edibleParts": ["string"],
                      "description": "string",
                      "toxicParts": ["string"],
                      "safetyWarnings": ["string"],
                      "funFact": "string",
                      "videoContext": "recipes" or "uses"
                    }
                  ]
                }
                Do not include markdown formatting like \`\`\`json. Return only the JSON.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        stop: null
      });

      // 3. Robust Parsing
      const text = completion.choices[0]?.message?.content || "{}";
      let data = {};
      
      try {
          data = JSON.parse(text);
      } catch (e) {
          console.error("JSON Parse Error", e);
          // Fallback regex
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
      } else {
         // Fallback if structure is wrong but we got a response
         if (!data.plants && text.includes("commonName")) {
             // Try to wrap single object in array if model messed up structure
             plants = [{ ...data, id: Date.now() }];
         }
      }

      return { plants };

    } catch (error) {
      console.error("Groq API Error:", error);
      return { error: error.message || "Unable to identify plant." };
    }
  },

  findSpecificRecipes: async (plantName) => {
    try {
      // Groq does not have internet access/grounding tools like Gemini.
      // We will generate suggested video titles and construct standard YouTube Search URLs.
      
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [
            {
                role: "system",
                content: "You are a helper that generates YouTube video search queries."
            },
            {
                role: "user",
                content: `Generate 3 popular video title ideas for "${plantName} recipes or uses". 
                Return strictly a JSON array of strings. Example: ["How to cook Plant", "Plant benefits"]`
            }
        ],
        response_format: { type: "json_object" }
      });

      const text = completion.choices[0]?.message?.content || "{}";
      let titles = [];
      try {
          const parsed = JSON.parse(text);
          // Handle various possible JSON outputs from LLaMA
          if (parsed.titles) titles = parsed.titles;
          else if (Array.isArray(parsed)) titles = parsed;
          else if (parsed.queries) titles = parsed.queries;
          else titles = Object.values(parsed)[0] || [];
      } catch (e) {
          titles = [`${plantName} Recipe`, `${plantName} Uses`, `${plantName} Care`];
      }

      // Construct clickable objects
      return titles.slice(0, 3).map((title, idx) => ({
          title: title,
          channel: "YouTube Search",
          link: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
          duration: "Watch"
      }));

    } catch (e) {
      console.warn("Search generation failed", e);
      // Fallback
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