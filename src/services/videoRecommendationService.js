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
      // Improved prompt to be more aggressive in finding REAL content.
      // It searches for recipes if edible, or care guides otherwise.
      const prompt = `Perform a deep YouTube search for the plant: "${plantName}".
      If the plant is edible, focus on "culinary preparation and recipes".
      If not edible, focus on "botanical care and identification".
      Use the Google Search tool to find AT LEAST 3 ACTUAL ACTIVE YOUTUBE LINKS.
      Return strictly a JSON array of objects: 
      [{"title": "Accurate Title", "channel": "Channel Name", "link": "https://www.youtube.com/watch?v=...", "reason": "why this is relevant"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let videos = [];
      if (jsonMatch) {
        try {
          videos = JSON.parse(jsonMatch[0]);
        } catch (e) { 
          console.warn("JSON Parse Error in video service", e);
        }
      }

      const validVideos = _validateVideos(videos).slice(0, 3);
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }
      return validVideos;
    } catch (error) {
      console.error("Video Search Error:", error);
      return [];
    }
  }
};