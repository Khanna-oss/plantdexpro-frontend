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
      const searchQuery = context === 'recipes' 
        ? `Official culinary preparation and nutritional facts for ${plantName} plant`
        : `Scientific botanical identification guide for ${plantName}`;

      const prompt = `Find 3 high-quality YouTube videos for: "${searchQuery}". 
      You MUST return a JSON array of objects. 
      Each object MUST have: "title", "channel", "link" (a REAL YouTube URL), and "reason".
      Search for real, existing videos. Verify the URLs correspond to the plant "${plantName}".
      JSON format ONLY: [{"title": "...", "channel": "...", "link": "https://www.youtube.com/watch?v=...", "reason": "..."}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      let videos = [];
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          videos = JSON.parse(jsonMatch[0]);
        } catch (e) { 
          console.error("YT Parse Error - Retrying with strict format", e);
        }
      }

      const validVideos = _validateVideos(videos).slice(0, 3);
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }
      return validVideos;
    } catch (error) {
      console.error("YouTube Logic Error:", error);
      return [];
    }
  }
};