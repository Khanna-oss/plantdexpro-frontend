// Simple string hash for caching keys
const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. CACHE CHECK (The "Self-Learning" Feature)
    // Create a unique fingerprint for this image based on first 1000 chars (speed)
    const imageHash = hashString(base64Image.substring(0, 1000)); 
    const cacheKey = `plant_dex_cache_${imageHash}`;
    
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      console.log("⚡ Lightning Cache Hit! Loading instantly...");
      return JSON.parse(cachedResult);
    }

    // 2. API REQUEST
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const API_URL = `${cleanBaseUrl}/api/identify-plant`;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // 3. CACHE SAVE
      // Store successful results for future lightning load
      if (data.plants && data.plants.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          // If cache is full, clear old entries or ignore
          console.warn("Cache full or disabled");
        }
      }

      return data;
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  },
  
  findSpecificRecipes: async (plantName) => { return []; }
};