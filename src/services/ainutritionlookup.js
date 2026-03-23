import { etlNutritionService } from "./etlNutritionService.js";

/**
 * Truthful Nutrition Lookup Pipeline
 *
 * Tier 1 — ETL Data Warehouse (USDA / Botanical references, hardcoded, 28 species)
 * Tier 2 — USDA FoodData Central REST API (free DEMO_KEY, no registration needed)
 * Tier 3 — Honest "not available" (no AI-generated values — they cannot be verified)
 *
 * USDA FoodData Central: https://fdc.nal.usda.gov/
 * Rate limit for DEMO_KEY: ~30 req/hour. Use VITE_USDA_API_KEY for production.
 */

const CACHE_PREFIX = 'plantdex_nutrition_v3_';
const TTL = 7 * 24 * 60 * 60 * 1000; // 7-day cache (USDA data is stable)
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

// ── USDA FoodData Central lookup ────────────────────────────────────────────

const fetchFromUSDA = async (plantName, scientificName) => {
  const apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
  const query = scientificName || plantName;

  try {
    const url = `${USDA_BASE}/foods/search?` + new URLSearchParams({
      query,
      api_key: apiKey,
      pageSize: '1',
      dataType: 'Foundation,SR Legacy'
    });

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const json = await res.json();
    const food = json.foods?.[0];
    if (!food) return null;

    // Extract nutrients from USDA nutrient array
    const get = (names) => {
      const matches = food.foodNutrients?.filter(n =>
        names.some(name => (n.nutrientName || '').toLowerCase().includes(name.toLowerCase()))
      ) || [];
      if (!matches.length) return null;
      return matches.map(n => `${n.nutrientName} (${n.value} ${n.unitName})`).join(', ');
    };

    const vitamins = get(['vitamin a', 'vitamin c', 'vitamin d', 'vitamin e', 'vitamin k', 'thiamin', 'riboflavin', 'niacin', 'vitamin b-6', 'folate', 'vitamin b-12', 'choline']);
    const minerals = get(['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium', 'fluoride']);
    const proteins = get(['protein']);
    const energy = get(['energy']);
    const calories = energy ? energy.replace(/energy/i, '').trim() : null;

    if (!vitamins && !minerals && !proteins) return null;

    return {
      nutrients: {
        vitamins: vitamins || 'Specific values not reported in USDA dataset for this item',
        minerals: minerals || 'Specific values not reported in USDA dataset for this item',
        proteins: proteins || 'Protein value not reported in USDA dataset',
        calories: calories || 'Caloric value not reported in USDA dataset'
      },
      botanicalData: {},
      healthHints: [
        { label: 'USDA FoodData Central', desc: `Data retrieved from USDA FDC (ID: ${food.fdcId}, "${food.description}"). SR Legacy / Foundation Foods.` }
      ],
      isVerified: true,
      source: `USDA FoodData Central — ${food.description}`
    };
  } catch {
    return null;
  }
};

// ── Public API ───────────────────────────────────────────────────────────────

export const aiNutritionLookup = {
  fetchNutrition: async (plantName, scientificName) => {

    // ── Tier 1: ETL Data Warehouse ─────────────────────────────────────────
    const etlResult = etlNutritionService.lookup(scientificName, plantName);
    if (etlResult) return etlResult;

    // ── Cache check before network call ───────────────────────────────────
    const lookupKey = (scientificName || plantName || 'unknown').toLowerCase().replace(/\W/g, '_');
    const cacheKey = `${CACHE_PREFIX}${lookupKey}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < TTL) return data;
      }
    } catch { /* ignore corrupted cache */ }

    // ── Tier 2: USDA FoodData Central ─────────────────────────────────────
    const usdaResult = await fetchFromUSDA(plantName, scientificName);
    if (usdaResult) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data: usdaResult, ts: Date.now() }));
      } catch { /* ignore storage errors */ }
      return usdaResult;
    }

    // ── Tier 3: Honest unavailable — no AI fabrication ────────────────────
    return null;
  }
};