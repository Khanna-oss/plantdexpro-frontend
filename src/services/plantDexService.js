export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // Production URL from Vercel Env, or localhost fallback
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // remove trailing slash if present
    const API_URL = `${cleanBaseUrl}/api/identify-plant`;
    
    console.log("🔌 Connecting to:", API_URL);

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
  
  // Helper retained for compatibility
  findSpecificRecipes: async (plantName) => {
    return [];
  }
};