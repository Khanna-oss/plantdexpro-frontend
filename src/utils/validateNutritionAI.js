
import { aiConfidenceService } from "../services/aiConfidenceService";

export const validateNutritionAI = (data) => {
  if (!data || typeof data !== 'object') return null;
  const { nutrients, healthHints, specificUsage } = data;

  if (!nutrients || !healthHints || !specificUsage) return null;
  
  // Hallucination Check (DW-U2)
  const combinedText = JSON.stringify(data);
  if (aiConfidenceService.detectHallucination(combinedText)) {
    return null;
  }

  // Ensure we have at least some basic data before showing to user
  if (!nutrients.vitamins || !nutrients.minerals) return null;

  return data;
};
