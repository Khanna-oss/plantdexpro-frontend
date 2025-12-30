
const THUMBNAIL_CACHE_KEY = 'plantdex_thumb_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const youtubeThumbnailCache = {
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
      console.warn("Thumbnail cache full", e);
    }
  }
};
