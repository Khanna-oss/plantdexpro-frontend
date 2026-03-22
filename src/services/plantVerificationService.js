/**
 * Plant Verification Service
 * Cross-checks AI identification results against verified plant database
 * Implements truthful data layer with provenance tracking
 */

import verifiedPlantsData from '../data/verifiedPlants.json';

const VERIFICATION_CACHE_KEY = 'plantdex_verification_v2';
const USER_CONFIRMATIONS_KEY = 'plantdex_user_confirmations_v1';

/**
 * Normalize plant names for fuzzy matching
 */
const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate similarity score between two strings (0-100)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeName(str1);
  const s2 = normalizeName(str2);
  
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 85;
  
  // Simple word overlap scoring
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const overlap = words1.filter(w => words2.includes(w)).length;
  const maxWords = Math.max(words1.length, words2.length);
  
  return Math.round((overlap / maxWords) * 70);
};

/**
 * Find matching verified plant from database
 */
const findVerifiedMatch = (scientificName, commonName) => {
  const plants = verifiedPlantsData.plants || [];
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const plant of plants) {
    // Check scientific name match
    const sciScore = calculateSimilarity(scientificName, plant.scientificName);
    
    // Check common name matches
    const commonScores = plant.commonNames.map(cn => 
      calculateSimilarity(commonName, cn)
    );
    const maxCommonScore = Math.max(...commonScores, 0);
    
    // Take the best score
    const score = Math.max(sciScore, maxCommonScore);
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { ...plant, matchScore: score };
    }
  }
  
  return bestMatch;
};

/**
 * Get verification cache from localStorage
 */
const getVerificationCache = () => {
  try {
    const cache = localStorage.getItem(VERIFICATION_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (e) {
    console.error('Failed to read verification cache:', e);
    return {};
  }
};

/**
 * Update verification cache with new identification
 */
const updateVerificationCache = (scientificName, commonName, confidence, isVerified) => {
  const cache = getVerificationCache();
  const key = normalizeName(scientificName || commonName);
  
  if (!cache[key]) {
    cache[key] = {
      scientificName,
      commonName,
      identifications: [],
      avgConfidence: 0,
      isVerified: false,
      userConfirmed: false
    };
  }
  
  cache[key].identifications.push({
    timestamp: Date.now(),
    confidence,
    isVerified
  });
  
  // Calculate average confidence from recent identifications (last 10)
  const recentIds = cache[key].identifications.slice(-10);
  cache[key].avgConfidence = Math.round(
    recentIds.reduce((sum, id) => sum + id.confidence, 0) / recentIds.length
  );
  
  // Mark as verified if we have 3+ high-confidence matches or 1 verified match
  if (isVerified || (recentIds.length >= 3 && cache[key].avgConfidence >= 85)) {
    cache[key].isVerified = true;
  }
  
  try {
    localStorage.setItem(VERIFICATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to update verification cache:', e);
  }
  
  return cache[key];
};

/**
 * Check verification status of a plant
 */
const checkVerificationStatus = (scientificName, commonName) => {
  const cache = getVerificationCache();
  const key = normalizeName(scientificName || commonName);
  const entry = cache[key];
  
  if (!entry) {
    return {
      isVerified: false,
      count: 0,
      avgConfidence: 0,
      source: 'none'
    };
  }
  
  return {
    isVerified: entry.isVerified,
    count: entry.identifications.length,
    avgConfidence: entry.avgConfidence,
    userConfirmed: entry.userConfirmed || false,
    source: entry.isVerified ? 'verified_cache' : 'ai_inference'
  };
};

/**
 * Main verification function - enriches AI result with verified data
 */
export const verifyPlantIdentification = (aiResult) => {
  if (!aiResult || !aiResult.scientificName) {
    return {
      ...aiResult,
      verificationStatus: 'unverified',
      verificationLevel: 'none',
      dataSource: 'ai_inference_only',
      provenance: {
        primary: 'Gemini AI',
        verified: false,
        confidence: aiResult?.confidenceScore || 0
      }
    };
  }
  
  const { scientificName, commonName, confidenceScore = 0 } = aiResult;
  
  // 1. Check against verified database
  const verifiedMatch = findVerifiedMatch(scientificName, commonName);
  
  if (verifiedMatch && verifiedMatch.matchScore >= 85) {
    // High-confidence match with verified database
    updateVerificationCache(scientificName, commonName, confidenceScore, true);
    
    return {
      ...aiResult,
      // Override with verified data
      scientificName: verifiedMatch.scientificName,
      commonName: verifiedMatch.commonNames[0],
      family: verifiedMatch.family,
      isEdible: verifiedMatch.isEdible,
      description: verifiedMatch.description || aiResult.description,
      // Add verified nutrition data
      nutrients: verifiedMatch.nutrients,
      botanicalData: {
        edibleParts: verifiedMatch.edibleParts,
        usage: verifiedMatch.usage,
        cautions: verifiedMatch.cautions
      },
      habitat: verifiedMatch.habitat,
      conservationStatus: verifiedMatch.conservationStatus,
      // Verification metadata
      verificationStatus: 'verified',
      verificationLevel: verifiedMatch.verificationLevel,
      dataSource: 'etl_verified_database',
      matchScore: verifiedMatch.matchScore,
      provenance: {
        primary: 'ETL Verified Database',
        secondary: 'Gemini AI',
        verified: true,
        confidence: Math.max(confidenceScore, verifiedMatch.confidence),
        matchAccuracy: verifiedMatch.matchScore
      }
    };
  }
  
  // 2. Check verification cache for repeated identifications
  const cacheStatus = checkVerificationStatus(scientificName, commonName);
  
  if (cacheStatus.isVerified && cacheStatus.avgConfidence >= 85) {
    updateVerificationCache(scientificName, commonName, confidenceScore, false);
    
    return {
      ...aiResult,
      verificationStatus: 'cache_verified',
      verificationLevel: 'medium',
      dataSource: 'repeated_identification',
      provenance: {
        primary: 'Gemini AI',
        verified: true,
        confidence: confidenceScore,
        repeatCount: cacheStatus.count,
        avgConfidence: cacheStatus.avgConfidence,
        note: `Verified through ${cacheStatus.count} consistent identifications`
      }
    };
  }
  
  // 3. Partial match or low confidence - mark as AI inference only
  if (verifiedMatch && verifiedMatch.matchScore >= 70) {
    updateVerificationCache(scientificName, commonName, confidenceScore, false);
    
    return {
      ...aiResult,
      verificationStatus: 'partial_match',
      verificationLevel: 'low',
      dataSource: 'ai_with_partial_verification',
      matchScore: verifiedMatch.matchScore,
      suggestedMatch: {
        scientificName: verifiedMatch.scientificName,
        commonName: verifiedMatch.commonNames[0],
        matchScore: verifiedMatch.matchScore
      },
      provenance: {
        primary: 'Gemini AI',
        verified: false,
        confidence: confidenceScore,
        note: `Partial match found (${verifiedMatch.matchScore}% similarity)`
      }
    };
  }
  
  // 4. No match - pure AI inference
  updateVerificationCache(scientificName, commonName, confidenceScore, false);
  
  return {
    ...aiResult,
    verificationStatus: 'unverified',
    verificationLevel: 'none',
    dataSource: 'ai_inference_only',
    provenance: {
      primary: 'Gemini AI',
      verified: false,
      confidence: confidenceScore,
      note: 'No verified reference data available for this species'
    }
  };
};

/**
 * Get all verified plants from database
 */
export const getVerifiedPlants = () => {
  return verifiedPlantsData.plants || [];
};

/**
 * Get verification statistics
 */
export const getVerificationStats = () => {
  const cache = getVerificationCache();
  const entries = Object.values(cache);
  
  return {
    totalIdentifications: entries.reduce((sum, e) => sum + e.identifications.length, 0),
    verifiedSpecies: entries.filter(e => e.isVerified).length,
    totalSpecies: entries.length,
    avgConfidence: entries.length > 0 
      ? Math.round(entries.reduce((sum, e) => sum + e.avgConfidence, 0) / entries.length)
      : 0
  };
};

/**
 * Clear verification cache (for testing/debugging)
 */
export const clearVerificationCache = () => {
  localStorage.removeItem(VERIFICATION_CACHE_KEY);
  localStorage.removeItem(USER_CONFIRMATIONS_KEY);
};

export const plantVerificationService = {
  verifyPlantIdentification,
  checkVerificationStatus,
  updateVerificationCache,
  getVerifiedPlants,
  getVerificationStats,
  clearVerificationCache
};
