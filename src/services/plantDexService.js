// Simple hash function for image data
const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return hash;
};

const CACHE_KEY_HISTORY = 'plant_dex_history';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. CACHE CHECK
    const imageHash = hashString(base64Image.substring(0, 5000)); // Hash first 5k chars
    const cacheKey = `plant_dex_cache_${imageHash}`;
    
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      console.log("⚡ Cache Hit!");
      return JSON.parse(cachedResult);
    }

    // 2. LIVE API CALL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    try {
      const response = await fetch(`${cleanBaseUrl}/api/identify-plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      
      // 3. SAVE TO CACHE (Self-Learning)
      if (data.plants && data.plants.length > 0) {
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            
            // Update History
            const history = JSON.parse(localStorage.getItem(CACHE_KEY_HISTORY) || '[]');
            const newEntry = {
                id: data.plants[0].id,
                name: data.plants[0].commonName,
                image: data.plants[0].imageUrl || data.plants[0].youtubeImage, 
                date: new Date().toLocaleDateString()
            };
            const updatedHistory = [newEntry, ...history.filter(h => h.name !== newEntry.name)].slice(0, 12);
            localStorage.setItem(CACHE_KEY_HISTORY, JSON.stringify(updatedHistory));
        } catch (e) { console.warn("Cache error", e); }
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
  
  getHistory: () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY_HISTORY) || '[]'); } catch { return []; }
  }
};