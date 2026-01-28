import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService.js";

const _validateVideos = (videos) => {
  if (!Array.isArray(videos)) return [];
  return videos.filter(video => {
    if (!video.title || !video.link || !video.channel) return false;
    try {
      const url = new URL(video.link);
      const isYT = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
      return isYT && (video.link.includes('watch?v=') || video.link.includes('youtu.be/'));
    } catch (e) { return false; }
  });
};

export const videoRecommendationService = {
  getRecommendedVideos: async (plantName, context = 'recipes') => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return [];
    
    const cacheKey = youtubeCacheService.generateKey(plantName, context);
    const cached = youtubeCacheService.get(cacheKey);
    if (cached) {
      const valid = _validateVideos(cached);
      if (valid.length > 0) return valid;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
      const prompt = `Search for REAL YouTube video recipes for the plant: "${plantName}".
      You MUST use the Google Search tool to find actual live links.
      Find at least 3 videos with valid youtube.com/watch?v= URLs.
      Return strictly a JSON array: [{"title": "Title", "channel": "Channel", "link": "https://www.youtube.com/watch?v=...", "duration": "M:SS", "reason": "why this recipe is good"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let videos = [];
      if (jsonMatch) {
        try {
          videos = JSON.parse(jsonMatch[0]);
        } catch (e) { 
          console.warn("Recipe JSON Parse Error", e); 
        }
      }

      const validVideos = _validateVideos(videos).slice(0, 3);
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }
      return validVideos;
    } catch (error) {
      console.error("Recipe Search Pipeline Failed:", error);
      return [];
    }
  }
};