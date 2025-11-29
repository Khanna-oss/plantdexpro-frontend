export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // Priority: 
    // 1. VITE_API_URL (Set in Vercel)
    // 2. Default to localhost (for local dev)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Ensure no double slashes if user added trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const API_URL = `${cleanBaseUrl}/api/identify-plant`;
    
    console.log("🔌 Connecting to API:", API_URL);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  },
  
  // Deprecated: Backend now handles this, but keeping function sig to prevent crashes
  findSpecificRecipes: async (plantName) => {
    return [];
  }
};