/**
 * Simple persistent cache for YouTube thumbnail metadata.
 * Helps reduce layout shift and prevents repeated fetches.
 */

const THUMBNAIL_CACHE_KEY = 'plantdex_thumb_cache_v2';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const youtubeThumbnailCache = {
  /**
   * Retrieves a cached thumbnail URL for a given video ID.
   */
  get: (videoId) => {
    try {
      const cache = JSON.parse(localStorage.getItem(THUMBNAIL_CACHE_KEY) || '{}');
      const entry = cache[videoId];
      if (entry && (Date.now() - entry.cachedAt < CACHE_EXPIRY)) {
        return entry.thumbnailUrl;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Stores a thumbnail URL for a given video ID.
   */
  set: (videoId, thumbnailUrl) => {
    try {
      const cache = JSON.parse(localStorage.getItem(THUMBNAIL_CACHE_KEY) || '{}');
      cache[videoId] = {
        thumbnailUrl,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY
      };
      localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // If storage is full, clear it and try once more
      localStorage.removeItem(THUMBNAIL_CACHE_KEY);
      console.warn("YouTube Thumbnail Cache was cleared due to storage limits.");
    }
  }
};