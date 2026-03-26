import { compressImage } from '../utils/imageHelper.js';
import { identifyPlantCandidates } from './plantModelService.js';
import { aiNutritionLookup } from './ainutritionlookup.js';
import { videoRecommendationService } from './videorecommendationservice.js';
import { plantVerificationService } from './plantVerificationService.js';
import { trefleService } from './trefleService.js';
import { wikipediaService } from './wikipediaService.js';
import { iucnService } from './iucnService.js';
import { saveToHistory } from './identificationHistoryService.js';

const buildFeatureImportance = (visualFeatures = []) => {
  if (!Array.isArray(visualFeatures)) {
    return [];
  }

  return visualFeatures.map((feature, index) => ({
    feature: feature.part,
    explanation: feature.reason,
    importance: Math.max(0.95 - (index * 0.15), 0.35),
  }));
};

const generateTraceId = (prefix) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const preprocessInput = async (input) => {
  if (typeof input === 'string') {
    return {
      base64Image: input,
      meta: {
        inputType: 'base64',
        compressed: false,
        payloadLength: input.length,
      },
    };
  }

  const isFileLike = typeof File !== 'undefined' && input instanceof File;
  if (!isFileLike) {
    throw new Error('Unsupported input. Please upload a valid image file.');
  }

  const base64Image = await compressImage(input);

  return {
    base64Image,
    meta: {
      inputType: 'file',
      compressed: true,
      originalName: input.name,
      originalSizeBytes: input.size,
      mimeType: input.type,
      payloadLength: base64Image.length,
    },
  };
};

const buildFallbackReasoning = (validatedPlant, referenceSignals) => {
  if (validatedPlant?.verificationStatus === 'verified') {
    return {
      strategy: 'authoritative_reference_override',
      resolution: 'verified_database',
      reason: 'Primary candidate aligned with the ETL verified reference catalog.',
      referenceSignals,
    };
  }

  if (validatedPlant?.verificationStatus === 'cache_verified') {
    return {
      strategy: 'consensus_cache_confirmation',
      resolution: 'verification_cache',
      reason: validatedPlant?.provenance?.note || 'Candidate confirmed through repeated consistent identifications.',
      referenceSignals,
    };
  }

  if (validatedPlant?.verificationStatus === 'partial_match') {
    return {
      strategy: 'partial_reference_alignment',
      resolution: 'suggested_match',
      reason: validatedPlant?.provenance?.note || 'Candidate partially aligned with a verified reference.',
      suggestion: validatedPlant?.suggestedMatch || referenceSignals?.matchCandidate || null,
      referenceSignals,
    };
  }

  return {
    strategy: 'model_only_truthful_fallback',
    resolution: 'ai_inference_only',
    reason: validatedPlant?.provenance?.note || 'No verified reference data available for this species.',
    referenceSignals,
  };
};

const orchestrateEnrichment = async (plant) => {
  let enrichedPlant = { ...plant };
  const externalSources = [];

  if (enrichedPlant.isEdible && !enrichedPlant.nutrients) {
    const nutrition = await aiNutritionLookup.fetchNutrition(enrichedPlant.commonName, enrichedPlant.scientificName).catch(() => null);
    if (nutrition) {
      enrichedPlant.nutrients = nutrition.nutrients;
      enrichedPlant.botanicalData = { ...enrichedPlant.botanicalData, ...nutrition.botanicalData };
      enrichedPlant.healthHints = nutrition.healthHints;
      enrichedPlant.nutritionVerified = nutrition.isVerified === true;
      enrichedPlant.nutritionSource = nutrition.source || 'External API';
      externalSources.push(enrichedPlant.nutritionSource);
    }
  }

  const [trefleData, wikiData, iucnData, videos] = await Promise.all([
    trefleService.getTrefleEnrichment(enrichedPlant.scientificName, enrichedPlant.commonName).catch(() => null),
    wikipediaService.getWikipediaEnrichment(enrichedPlant.scientificName, enrichedPlant.commonName).catch(() => null),
    iucnService.getIucnEnrichment(enrichedPlant.scientificName).catch(() => null),
    (enrichedPlant.isEdible
      ? videoRecommendationService.getRecommendedVideos(enrichedPlant.commonName, 'recipes')
      : videoRecommendationService.getRecommendedVideos(enrichedPlant.commonName, 'care')).catch(() => []),
  ]);

  if (trefleData) {
    enrichedPlant.trefleEnrichment = trefleData;
    externalSources.push(trefleData.source || 'Trefle Botanical Database');
  }

  if (wikiData) {
    enrichedPlant.wikipediaEnrichment = wikiData;
    externalSources.push(wikiData.source || 'Wikipedia');
  }

  if (iucnData) {
    enrichedPlant.iucnEnrichment = iucnData;
    externalSources.push(iucnData.source || 'IUCN Red List');
    if (!enrichedPlant.conservationStatus && iucnData.available && iucnData.categoryLabel) {
      enrichedPlant.conservationStatus = iucnData.categoryLabel;
    }
  }

  if (Array.isArray(videos) && videos.length > 0) {
    enrichedPlant.recipeVideos = videos;
    externalSources.push('YouTube Discovery');
  }

  return {
    plant: enrichedPlant,
    meta: {
      applied: true,
      nutritionVerified: enrichedPlant.nutritionVerified === true,
      nutritionSource: enrichedPlant.nutritionSource || null,
      videoCount: Array.isArray(enrichedPlant.recipeVideos) ? enrichedPlant.recipeVideos.length : 0,
      externalSources: [...new Set(externalSources)],
    },
  };
};

const attachPipelineMetadata = ({
  plant,
  extraction,
  referenceSignals,
  fallbackReasoning,
  enrichmentMeta,
  candidateIndex,
  totalCandidates,
  fullEnrichment,
  identificationId,
  pipelineSessionId,
}) => {
  const hbdoMeta = {
    pipeline: 'HBDO',
    version: '1.0',
    identificationId,
    pipelineSessionId,
    candidateId: `${identificationId}_candidate_${candidateIndex + 1}`,
    candidateRank: candidateIndex + 1,
    totalCandidates,
    fullEnrichment,
    retrieval: {
      source: referenceSignals.retrievalSource,
      confidence: referenceSignals.retrievalConfidence,
      matchTier: referenceSignals.matchTier,
      hasReferenceSignal: referenceSignals.hasReferenceSignal,
      cacheStatus: referenceSignals.cacheStatus,
    },
    validation: {
      verificationStatus: plant.verificationStatus || 'unverified',
      verificationLevel: plant.verificationLevel || 'none',
      dataSource: plant.dataSource || 'ai_inference_only',
    },
    fallbackReasoning,
    enrichment: enrichmentMeta,
    featureExtraction: {
      modelName: extraction.modelName,
      inferenceLatencyMs: extraction.inferenceLatencyMs,
      finishedAt: extraction.finishedAt,
    },
  };

  const stageSummary = {
    retrievalSource: referenceSignals.retrievalSource,
    retrievalMatchTier: referenceSignals.matchTier,
    validationStatus: plant.verificationStatus || 'unverified',
    fallbackStrategy: fallbackReasoning.strategy,
    enrichedSources: enrichmentMeta.externalSources,
  };

  return {
    ...plant,
    hbdoMeta,
    xaiMeta: {
      confidence: plant.confidenceScore || 0,
      inferenceLatencyMs: extraction.inferenceLatencyMs,
      modelName: extraction.modelName,
      timestamp: extraction.finishedAt,
      source: plant.dataSource || 'ai_inference_only',
      verificationLevel: plant.verificationLevel || 'none',
      pipeline: 'HBDO',
      retrievalSource: referenceSignals.retrievalSource,
      matchTier: referenceSignals.matchTier,
      fallbackStrategy: fallbackReasoning.strategy,
      stageSummary,
      featureImportance: buildFeatureImportance(plant.visualFeatures),
    },
  };
};

const processCandidate = async ({
  candidate,
  extraction,
  candidateIndex,
  totalCandidates,
  fullEnrichment,
  identificationId,
  pipelineSessionId,
}) => {
  const referenceSignals = plantVerificationService.inspectReferenceSignals(candidate);
  const validatedPlant = plantVerificationService.verifyPlantIdentification(candidate);
  const fallbackReasoning = buildFallbackReasoning(validatedPlant, referenceSignals);

  let finalPlant = validatedPlant;
  let enrichmentMeta = {
    applied: false,
    nutritionVerified: false,
    nutritionSource: null,
    videoCount: 0,
    externalSources: [],
  };

  if (fullEnrichment) {
    const enrichment = await orchestrateEnrichment(validatedPlant);
    finalPlant = enrichment.plant;
    enrichmentMeta = enrichment.meta;
  }

  return attachPipelineMetadata({
    plant: finalPlant,
    extraction,
    referenceSignals,
    fallbackReasoning,
    enrichmentMeta,
    candidateIndex,
    totalCandidates,
    fullEnrichment,
    identificationId,
    pipelineSessionId,
  });
};

const buildPipelineMeta = ({ preprocessing, extraction, primaryPlant, candidateCount, startedAt, finishedAt, identificationId, pipelineSessionId }) => ({
  pipeline: 'HBDO',
  version: '1.0',
  identificationId,
  pipelineSessionId,
  startedAt,
  finishedAt,
  totalLatencyMs: finishedAt - startedAt,
  candidatesProcessed: candidateCount,
  stages: {
    preprocessing: {
      status: 'completed',
      ...preprocessing.meta,
    },
    featureExtraction: {
      status: 'completed',
      modelName: extraction.modelName,
      inferenceLatencyMs: extraction.inferenceLatencyMs,
      candidatesDetected: extraction.plants.length,
    },
    retrieval: {
      status: 'completed',
      ...primaryPlant.hbdoMeta.retrieval,
    },
    validation: {
      status: 'completed',
      ...primaryPlant.hbdoMeta.validation,
    },
    fallbackReasoning: {
      status: 'completed',
      ...primaryPlant.hbdoMeta.fallbackReasoning,
    },
    enrichment: {
      status: 'completed',
      ...primaryPlant.hbdoMeta.enrichment,
    },
  },
});

export const identifyPlant = async (input) => {
  const startedAt = Date.now();
  const identificationId = generateTraceId('ident');
  const pipelineSessionId = generateTraceId('hbdo');

  try {
    const preprocessing = await preprocessInput(input);
    const extraction = await identifyPlantCandidates(preprocessing.base64Image);

    if (extraction.error) {
      return { error: extraction.error };
    }

    if (!Array.isArray(extraction.plants) || extraction.plants.length === 0) {
      return { error: 'No plants identified. Try a clearer image.' };
    }

    const candidates = extraction.plants.slice(0, 3);
    const processedPlants = [];

    for (let index = 0; index < candidates.length; index += 1) {
      const processedPlant = await processCandidate({
        candidate: candidates[index],
        extraction,
        candidateIndex: index,
        totalCandidates: candidates.length,
        fullEnrichment: index === 0,
        identificationId,
        pipelineSessionId,
      });
      processedPlants.push(processedPlant);
    }

    const primaryPlant = processedPlants[0];

    saveToHistory({
      name: primaryPlant.commonName || primaryPlant.scientificName,
      scientificName: primaryPlant.scientificName,
      date: new Date().toLocaleDateString(),
      image: `data:image/jpeg;base64,${preprocessing.base64Image}`,
      identificationId,
      pipelineSessionId,
      isEdible: primaryPlant.isEdible,
      confidence: primaryPlant.confidenceScore || 0,
      verified: primaryPlant.verificationStatus === 'verified',
      dataSource: primaryPlant.dataSource,
    });

    const finishedAt = Date.now();

    return {
      plants: processedPlants,
      pipelineMeta: buildPipelineMeta({
        preprocessing,
        extraction,
        primaryPlant,
        candidateCount: processedPlants.length,
        startedAt,
        finishedAt,
        identificationId,
        pipelineSessionId,
      }),
    };
  } catch (error) {
    console.error('HBDO pipeline error:', error);
    return { error: error?.message || 'Botanical identification failed. Please check your image clarity.' };
  }
};

export const hbdoPipelineService = {
  identifyPlant,
};
