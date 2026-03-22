/**
 * Trefle API Service
 * Fetches botanical enrichment data: habitat, taxonomy, growth info
 * Free tier: 120 requests/day
 * Docs: https://docs.trefle.io/
 */

const TREFLE_API_BASE = 'https://trefle.io/api/v1';
const CACHE_PREFIX = 'plantdex_trefle_v1_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Search for plant by scientific name
 */
const searchPlant = async (scientificName) => {
  const API_KEY = import.meta.env.VITE_TREFLE_API_KEY;
  
  if (!API_KEY) {
    console.warn('Trefle API key not configured');
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}${scientificName.toLowerCase().replace(/\s+/g, '_')}`;
  
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
    console.error('Cache read error:', e);
  }

  try {
    const searchUrl = `${TREFLE_API_BASE}/plants/search?token=${API_KEY}&q=${encodeURIComponent(scientificName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn(`Trefle API error: ${response.status}`);
      return null;
    }

    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      return null;
    }

    // Get the first match (usually most relevant)
    const plant = result.data[0];
    
    // Fetch detailed info
    const detailUrl = `${TREFLE_API_BASE}/plants/${plant.id}?token=${API_KEY}`;
    const detailResponse = await fetch(detailUrl);
    
    if (!detailResponse.ok) {
      return null;
    }

    const detailData = await detailResponse.json();
    const enrichedData = transformTrefleData(detailData.data);
    
    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: enrichedData,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Cache write error:', e);
    }

    return enrichedData;
  } catch (error) {
    console.error('Trefle API fetch error:', error);
    return null;
  }
};

/**
 * Transform Trefle API response to our format
 */
const transformTrefleData = (trefleData) => {
  if (!trefleData) return null;

  return {
    scientificName: trefleData.scientific_name,
    commonName: trefleData.common_name,
    family: trefleData.family?.name || trefleData.family_common_name,
    genus: trefleData.genus?.name,
    taxonomy: {
      kingdom: trefleData.main_species?.kingdom || 'Plantae',
      phylum: trefleData.main_species?.phylum || trefleData.main_species?.division,
      class: trefleData.main_species?.class,
      order: trefleData.main_species?.order,
      family: trefleData.family?.name,
      genus: trefleData.genus?.name,
      species: trefleData.main_species?.species
    },
    distribution: {
      native: trefleData.main_species?.distribution?.native || [],
      introduced: trefleData.main_species?.distribution?.introduced || []
    },
    growth: {
      phGrowth: trefleData.main_species?.growth?.ph_minimum 
        ? `${trefleData.main_species.growth.ph_minimum} - ${trefleData.main_species.growth.ph_maximum}`
        : null,
      light: trefleData.main_species?.growth?.light,
      atmosphericHumidity: trefleData.main_species?.growth?.atmospheric_humidity,
      minimumTemperature: trefleData.main_species?.growth?.minimum_temperature?.deg_c,
      maximumTemperature: trefleData.main_species?.growth?.maximum_temperature?.deg_c,
      soilNutriments: trefleData.main_species?.growth?.soil_nutriments,
      soilSalinity: trefleData.main_species?.growth?.soil_salinity,
      soilTexture: trefleData.main_species?.growth?.soil_texture,
      soilHumidity: trefleData.main_species?.growth?.soil_humidity
    },
    specifications: {
      lifespan: trefleData.main_species?.duration,
      growthRate: trefleData.main_species?.growth?.growth_rate,
      growthMonths: trefleData.main_species?.growth?.growth_months,
      bloomMonths: trefleData.main_species?.growth?.bloom_months,
      fruitMonths: trefleData.main_species?.growth?.fruit_months,
      averageHeight: trefleData.main_species?.specifications?.average_height?.cm,
      maximumHeight: trefleData.main_species?.specifications?.maximum_height?.cm,
      shape: trefleData.main_species?.specifications?.shape_and_orientation,
      toxicity: trefleData.main_species?.specifications?.toxicity
    },
    edibility: {
      edible: trefleData.main_species?.edible,
      ediblePart: trefleData.main_species?.edible_part || []
    },
    images: {
      flower: trefleData.main_species?.images?.flower?.[0]?.image_url,
      leaf: trefleData.main_species?.images?.leaf?.[0]?.image_url,
      habit: trefleData.main_species?.images?.habit?.[0]?.image_url,
      fruit: trefleData.main_species?.images?.fruit?.[0]?.image_url,
      bark: trefleData.main_species?.images?.bark?.[0]?.image_url
    },
    source: 'Trefle Botanical Database',
    lastUpdated: Date.now()
  };
};

/**
 * Get enrichment data for a plant
 */
export const getTrefleEnrichment = async (scientificName, commonName) => {
  if (!scientificName && !commonName) {
    return null;
  }

  // Try scientific name first
  let result = null;
  if (scientificName) {
    result = await searchPlant(scientificName);
  }

  // Fallback to common name if scientific name didn't work
  if (!result && commonName) {
    result = await searchPlant(commonName);
  }

  return result;
};

/**
 * Clear Trefle cache (for testing/debugging)
 */
export const clearTrefleCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export const trefleService = {
  getTrefleEnrichment,
  clearTrefleCache
};
