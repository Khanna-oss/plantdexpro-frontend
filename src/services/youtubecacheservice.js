
const CACHE_PREFIX = 'plantdex_yt_';
const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const youtubeCacheService = {
  /**
   * Generates a cache key based on query and context
   */
  generateKey: (query, context) => {
    return `${CACHE_PREFIX}${context}_${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  },

  /**
   * Retrieves data from local storage if valid
   */
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { value, timestamp } = JSON.parse(item);
      
      // Check Expiry
      if (Date.now() - timestamp > TTL) {
        localStorage.removeItem(key);
        return null;
      }
      
      return value;
    } catch (e) {
      console.warn("Cache retrieval failed", e);
      return null;
    }
  },

  /**
   * Saves data to local storage with timestamp
   */
  set: (key, value) => {
    try {
      const payload = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      localStorage.setItem(key, payload);
    } catch (e) {
      // Handle quota exceeded
      console.warn("Cache storage failed (Quota Exceeded?)", e);
      // Optional: Clear old cache items here if needed
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
      } catch (retryErr) {
        console.error("Cache completely failed", retryErr);
      }
    }
  }
};
