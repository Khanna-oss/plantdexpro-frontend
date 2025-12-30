
import { aiConfidenceService } from "../services/aiConfidenceService.js";

export const validateNutritionAI = (data) => {
  if (!data || typeof data !== 'object') return null;
  const { nutrients, healthHints, specificUsage } = data;

  if (!nutrients || !healthHints || !specificUsage) return null;
  
  // High-risk hallucination detection
  const combinedText = JSON.stringify(data);
  if (aiConfidenceService.detectHallucination(combinedText)) {
    return null;
  }

  // Allow high-level but scientific descriptors to pass through
  const hasVitamins = nutrients.vitamins && nutrients.vitamins.length > 5;
  const hasMinerals = nutrients.minerals && nutrients.minerals.length > 5;

  if (!hasVitamins && !hasMinerals) return null;

  return data;
};
