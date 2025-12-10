export const plantDexService = {
  identifyPlant: async (base64Image) => {
    // 1. API REQUEST (Always fresh, NO CACHE)
    // Priority: VITE_API_URL (Vercel) -> localhost (Dev)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const API_URL = `${cleanBaseUrl}/api/identify-plant`;
    
    console.log("🔌 Fetching fresh data from:", API_URL);

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
      return data;

    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  },
  
  getHistory: () => {
    // History functionality temporarily disabled or cleared
    return [];
  }
};