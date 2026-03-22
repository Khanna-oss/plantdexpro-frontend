/**
 * Wikipedia API Service
 * Fetches educational plant summaries and "Learn More" content
 * Free API with no rate limits
 * Docs: https://www.mediawiki.org/wiki/API:Main_page
 */

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';
const CACHE_PREFIX = 'plantdex_wiki_v1_';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Search Wikipedia for plant article
 */
const searchWikipedia = async (query) => {
  const cacheKey = `${CACHE_PREFIX}${query.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {
    console.error('Wikipedia cache read error:', e);
  }

  try {
    // Search for the article
    const searchUrl = `${WIKIPEDIA_API_BASE}?` + new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      origin: '*',
      srlimit: 1
    });

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      console.warn(`Wikipedia search error: ${searchResponse.status}`);
      return null;
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search || searchData.query.search.length === 0) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;
    const pageId = searchData.query.search[0].pageid;

    // Get extract and full URL
    const extractUrl = `${WIKIPEDIA_API_BASE}?` + new URLSearchParams({
      action: 'query',
      prop: 'extracts|info|pageimages',
      exintro: true,
      explaintext: true,
      exsentences: 4,
      inprop: 'url',
      piprop: 'thumbnail',
      pithumbsize: 500,
      pageids: pageId,
      format: 'json',
      origin: '*'
    });

    const extractResponse = await fetch(extractUrl);
    if (!extractResponse.ok) {
      return null;
    }

    const extractData = await extractResponse.json();
    const page = extractData.query?.pages?.[pageId];

    if (!page) {
      return null;
    }

    const enrichedData = {
      title: page.title,
      summary: page.extract || 'No summary available.',
      url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      thumbnail: page.thumbnail?.source || null,
      pageId: pageId,
      source: 'Wikipedia',
      lastUpdated: Date.now()
    };

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: enrichedData,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Wikipedia cache write error:', e);
    }

    return enrichedData;
  } catch (error) {
    console.error('Wikipedia API fetch error:', error);
    return null;
  }
};

/**
 * Get Wikipedia enrichment for a plant
 */
export const getWikipediaEnrichment = async (scientificName, commonName) => {
  if (!scientificName && !commonName) {
    return null;
  }

  // Try scientific name first (usually more accurate)
  let result = null;
  if (scientificName) {
    result = await searchWikipedia(scientificName);
  }

  // Fallback to common name if scientific name didn't work
  if (!result && commonName) {
    result = await searchWikipedia(commonName);
  }

  // If still no result, try with "plant" suffix
  if (!result && commonName) {
    result = await searchWikipedia(`${commonName} plant`);
  }

  return result;
};

/**
 * Get multiple related articles
 */
export const getRelatedArticles = async (query, limit = 3) => {
  try {
    const searchUrl = `${WIKIPEDIA_API_BASE}?` + new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      origin: '*',
      srlimit: limit
    });

    const response = await fetch(searchUrl);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (!data.query?.search) {
      return [];
    }

    return data.query.search.map(item => ({
      title: item.title,
      snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      pageId: item.pageid
    }));
  } catch (error) {
    console.error('Wikipedia related articles error:', error);
    return [];
  }
};

/**
 * Clear Wikipedia cache (for testing/debugging)
 */
export const clearWikipediaCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export const wikipediaService = {
  getWikipediaEnrichment,
  getRelatedArticles,
  clearWikipediaCache
};
