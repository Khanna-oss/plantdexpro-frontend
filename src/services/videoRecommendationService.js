import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService.js";

/**
 * Validates and cleans video objects found by the AI.
 */
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
      const prompt = `Find real YouTube videos (title, channel, link) showing ${context} for "${plantName}". 
      You MUST use Google Search to find actual existing videos.
      Return a JSON array of up to 3 objects. 
      JSON format ONLY: [{"title": "Video Name", "channel": "Channel Name", "link": "https://www.youtube.com/watch?v=...", "duration": "M:SS", "reason": "why useful"}]`;

      // Use gemini-3-pro-preview for high-quality web search integration
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "";
      // Extract JSON array robustly even if conversational text is present
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let videos = [];
      if (jsonMatch) {
        try {
          videos = JSON.parse(jsonMatch[0]);
        } catch (e) { 
          console.warn("YouTube JSON Parse Error", e); 
        }
      }

      const validVideos = _validateVideos(videos).slice(0, 3);
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }
      return validVideos;
    } catch (error) {
      console.error("YouTube Search Failed:", error);
      return [];
    }
  }
};