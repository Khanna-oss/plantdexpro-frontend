
import { aiConfidenceService } from "../services/aiConfidenceService";

export const validateNutritionAI = (data) => {
  if (!data || typeof data !== 'object') return null;
  const { nutrients, healthHints, specificUsage } = data;

  if (!nutrients || !healthHints || !specificUsage) return null;
  
  // Type checks
  if (typeof nutrients.vitamins !== 'string' || typeof nutrients.minerals !== 'string') return null;
  if (!Array.isArray(healthHints)) return null;

  // Hallucination Check
  const combinedText = `${nutrients.vitamins} ${nutrients.minerals} ${specificUsage} ${healthHints.map(h => h.desc).join(' ')}`;
  if (aiConfidenceService.detectHallucination(combinedText)) {
    console.warn("Hallucination detected in nutrition data. Rejecting.");
    return null;
  }

  // Ensure specific enough
  if (nutrients.vitamins.length < 3 || nutrients.minerals.length < 3) return null;

  return data;
};
