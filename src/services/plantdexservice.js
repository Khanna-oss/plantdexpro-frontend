import { hbdoPipelineService } from "./hbdoPipelineService.js";
import { videoRecommendationService } from "./videorecommendationservice.js";
import { plantVerificationService } from "./plantVerificationService.js";
import { getHistory as getIdentificationHistory, saveToHistory as saveIdentificationHistory } from "./identificationHistoryService.js";

export const plantDexService = {
  identifyPlant: async (input) => {
    return await hbdoPipelineService.identifyPlant(input);
  },

  // Delegate to plantVerificationService
  checkVerificationStatus: (scientificName, commonName) => {
    return plantVerificationService.checkVerificationStatus(scientificName, commonName);
  },

  getVerificationStats: () => {
    return plantVerificationService.getVerificationStats();
  },

  getVerifiedPlants: () => {
    return plantVerificationService.getVerifiedPlants();
  },

  findSpecificRecipes: async (query) => {
    return await videoRecommendationService.getRecommendedVideos(query, 'recipes');
  },

  getHistory: () => getIdentificationHistory(),
  saveToHistory: (item) => {
    saveIdentificationHistory(item);
  }
};