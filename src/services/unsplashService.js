/**
 * Unsplash API Service
 * Fetches high-quality nature/soil-themed background images
 * Free tier: 50 requests/hour
 * Docs: https://unsplash.com/documentation
 */

const UNSPLASH_API_BASE = 'https://api.unsplash.com';
const CACHE_KEY = 'plantdex_unsplash_bg_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ROTATION_INTERVAL = 60 * 60 * 1000; // 1 hour

// Curated collection of nature/soil themes
const SEARCH_QUERIES = [
  'soil texture',
  'earth nature',
  'botanical garden',
  'forest floor',
  'plant leaves',
  'nature macro',
  'organic soil',
  'green plants',
  'natural earth',
  'botanical research'
];

/**
 * Get cached background or fetch new one
 */
const getBackgroundImage = async () => {
  const API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  
  // If no API key, return default gradient
  if (!API_KEY) {
    console.warn('Unsplash API key not configured, using default background');
    return {
      url: null,
      photographer: null,
      photographerUrl: null,
      downloadUrl: null
    };
  }

  // Check cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      // Use cached image if less than rotation interval old
      if (age < ROTATION_INTERVAL) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }

  // Fetch new image
  try {
    // Random query from our curated list
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
    
    const url = `${UNSPLASH_API_BASE}/photos/random?` + new URLSearchParams({
      query: query,
      orientation: 'landscape',
      content_filter: 'high',
      client_id: API_KEY
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Unsplash API error: ${response.status}`);
      return getDefaultBackground();
    }

    const photo = await response.json();
    
    const backgroundData = {
      url: photo.urls.regular, // High quality but not too large
      blurUrl: photo.urls.small, // For blur effect
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadUrl: photo.links.download_location,
      color: photo.color,
      description: photo.description || photo.alt_description
    };

    // Trigger download endpoint (required by Unsplash API guidelines)
    if (backgroundData.downloadUrl) {
      fetch(`${backgroundData.downloadUrl}?client_id=${API_KEY}`).catch(() => {});
    }

    // Cache the result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: backgroundData,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Cache write error:', e);
    }

    return backgroundData;
  } catch (error) {
    console.error('Unsplash API fetch error:', error);
    return getDefaultBackground();
  }
};

/**
 * Default background when API is unavailable
 */
const getDefaultBackground = () => {
  return {
    url: null,
    photographer: null,
    photographerUrl: null,
    downloadUrl: null
  };
};

/**
 * Clear background cache (force refresh)
 */
const clearBackgroundCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

/**
 * Preload background image
 */
const preloadBackground = (url) => {
  if (!url) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = url;
  });
};

export const unsplashService = {
  getBackgroundImage,
  clearBackgroundCache,
  preloadBackground
};
