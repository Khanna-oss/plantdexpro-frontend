
export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // Use environment variable if available (Vercel), otherwise fallback to localhost (Local Dev)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const API_URL = `${baseUrl}/api/identify-plant`;
    
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
  
  // NOTE: The backend now handles finding videos, so this frontend method is deprecated/unused
  // but kept for compatibility if referenced elsewhere.
  findSpecificRecipes: async (plantName) => {
    return [];
  }
};
