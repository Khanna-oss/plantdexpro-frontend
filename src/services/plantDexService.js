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

const CACHE_KEY_HISTORY = 'plant_dex_history';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. CACHE CHECK (The "Self-Learning" Feature)
    const imageHash = hashString(base64Image.substring(0, 1000)); 
    const cacheKey = `plant_dex_cache_${imageHash}`;
    
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      console.log("⚡ Lightning Cache Hit! Loading instantly...");
      return JSON.parse(cachedResult);
    }

    // 2. API REQUEST
    // Priority: VITE_API_URL (Vercel) -> localhost (Dev)
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
      
      // 3. CACHE SAVE & HISTORY UPDATE
      if (data.plants && data.plants.length > 0) {
        try {
          // Save specific result cache
          localStorage.setItem(cacheKey, JSON.stringify(data));
          
          // Update History
          const history = JSON.parse(localStorage.getItem(CACHE_KEY_HISTORY) || '[]');
          const newEntry = {
            id: data.plants[0].id,
            name: data.plants[0].commonName,
            image: data.plants[0].imageUrl || data.plants[0].youtubeImage, // Save a valid URL
            date: new Date().toLocaleDateString()
          };
          
          // Add to top, remove duplicates, keep max 10
          const updatedHistory = [newEntry, ...history.filter(h => h.name !== newEntry.name)].slice(0, 10);
          localStorage.setItem(CACHE_KEY_HISTORY, JSON.stringify(updatedHistory));
          
        } catch (e) {
          console.warn("Cache full or disabled");
        }
      }

      return data;
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  },
  
  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY_HISTORY) || '[]');
    } catch {
      return [];
    }
  }
};