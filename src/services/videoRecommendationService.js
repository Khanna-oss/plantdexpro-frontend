import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService.js";

const API_KEY = process.env.API_KEY || '';

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
    if (!API_KEY) return [];
    
    const cacheKey = youtubeCacheService.generateKey(plantName, context);
    const cached = youtubeCacheService.get(cacheKey);
    if (cached) {
      const valid = _validateVideos(cached);
      if (valid.length > 0) return valid;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
      // Refined prompt for 'Useful and Meaningful' recipe videos
      const prompt = `Perform a Google Search for real YouTube videos showing culinary recipes and cooking methods using "${plantName}". 
      Focus on traditional or modern recipes that demonstrate preparation. 
      Return a JSON array of 3 objects with "title", "channel", "link" (actual https://www.youtube.com/watch?v=... URL), and a specific "reason" why this video is helpful for someone who found this plant. 
      JSON ONLY: [{"title": "...", "channel": "...", "link": "...", "reason": "..."}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      let videos = [];
      if (jsonMatch) {
        try {
          videos = JSON.parse(jsonMatch[0]);
        } catch (e) { console.error("YT Parse Failure", e); }
      }

      const validVideos = _validateVideos(videos).slice(0, 3);
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }
      return validVideos;
    } catch (error) {
      console.error("YouTube Recipe Search Error:", error);
      return [];
    }
  }
};