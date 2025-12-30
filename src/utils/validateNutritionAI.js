
import { aiConfidenceService } from "../services/aiConfidenceService.js";

export const validateNutritionAI = (data) => {
  if (!data || typeof data !== 'object') return null;
  const { nutrients, healthHints, specificUsage } = data;

  if (!nutrients || !healthHints || !specificUsage) return null;
  
  // Hallucination Check (DW-U2)
  const combinedText = JSON.stringify(data);
  if (aiConfidenceService.detectHallucination(combinedText)) {
    return null;
  }

  // Ensure we have at least the primary nutrients to avoid empty UI states
  if (!nutrients.vitamins && !nutrients.minerals) return null;

  return data;
};
