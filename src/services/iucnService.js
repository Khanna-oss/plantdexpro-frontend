const IUCN_API_BASE = 'https://apiv3.iucnredlist.org/api/v3';
const CACHE_PREFIX = 'plantdex_iucn_v1_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const CATEGORY_LABELS = {
  EX: 'Extinct',
  EW: 'Extinct in the Wild',
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

const normalizeName = (name = '') => name.toLowerCase().trim().replace(/\s+/g, '_');

const getCached = (key) => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp >= CACHE_TTL) {
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('IUCN cache read error:', error);
    return null;
  }
};

const setCached = (key, data) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('IUCN cache write error:', error);
  }
};

const buildUnavailable = (message, extra = {}) => ({
  available: false,
  source: 'IUCN Red List',
  message,
  lastUpdated: Date.now(),
  ...extra,
});

const parseLegacyResult = (data) => {
  const result = Array.isArray(data?.result) ? data.result[0] : null;

  if (!result) {
    return null;
  }

  const categoryCode = result.category || result.red_list_category_code || null;

  return {
    available: true,
    scientificName: result.scientific_name || result.taxon_scientific_name || null,
    categoryCode,
    categoryLabel: CATEGORY_LABELS[categoryCode] || categoryCode || 'Unavailable',
    assessmentDate: result.assessment_date || result.published_year || null,
    populationTrend: result.population_trend || null,
    criteria: result.criteria || null,
    scope: result.region || 'Global',
    url: result.url || null,
    source: 'IUCN Red List',
    lastUpdated: Date.now(),
  };
};

const parseAssessmentResult = (data) => {
  const taxon = data?.taxon;
  const assessments = Array.isArray(data?.assessments) ? data.assessments : [];
  const latestGlobal = assessments.find((assessment) =>
    assessment?.latest && assessment?.scopes?.some((scope) => scope?.code === '1' || scope?.description?.en === 'Global')
  );
  const latestAssessment = latestGlobal || assessments.find((assessment) => assessment?.latest) || assessments[0] || null;

  if (!taxon && !latestAssessment) {
    return null;
  }

  const categoryCode = latestAssessment?.red_list_category_code || null;
  const primaryCommonName = taxon?.common_names?.find((entry) => entry?.main)?.name || taxon?.common_names?.[0]?.name || null;

  return {
    available: true,
    scientificName: taxon?.scientific_name || latestAssessment?.taxon_scientific_name || null,
    commonName: primaryCommonName,
    categoryCode,
    categoryLabel: CATEGORY_LABELS[categoryCode] || categoryCode || 'Unavailable',
    assessmentDate: latestAssessment?.year_published || null,
    populationTrend: latestAssessment?.population_trend || null,
    criteria: latestAssessment?.criteria || null,
    scope: latestAssessment?.scopes?.[0]?.description?.en || 'Global',
    url: latestAssessment?.url || null,
    source: 'IUCN Red List',
    lastUpdated: Date.now(),
  };
};

export const getIucnEnrichment = async (scientificName) => {
  if (!scientificName) {
    return buildUnavailable('Scientific name unavailable for conservation lookup');
  }

  const cacheKey = normalizeName(scientificName);
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const apiToken = import.meta.env.VITE_IUCN_API_TOKEN || import.meta.env.VITE_IUCN_API_KEY;
  if (!apiToken) {
    return buildUnavailable('IUCN API token not configured', { requiresToken: true });
  }

  try {
    const response = await fetch(`${IUCN_API_BASE}/species/${encodeURIComponent(scientificName)}?token=${encodeURIComponent(apiToken)}`);

    if (!response.ok) {
      return buildUnavailable(`IUCN request failed (${response.status})`, { requiresToken: true });
    }

    const data = await response.json();
    const parsed = parseLegacyResult(data) || parseAssessmentResult(data);

    if (!parsed) {
      const unavailable = buildUnavailable('No IUCN assessment found for this species');
      setCached(cacheKey, unavailable);
      return unavailable;
    }

    setCached(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('IUCN enrichment error:', error);
    const unavailable = buildUnavailable(error.message || 'IUCN lookup failed', { requiresToken: true });
    setCached(cacheKey, unavailable);
    return unavailable;
  }
};

export const clearIucnCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export const iucnService = {
  getIucnEnrichment,
  clearIucnCache,
};
