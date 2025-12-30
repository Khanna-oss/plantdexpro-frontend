
/**
 * DW-U1 Integration: Data Warehousing & OLAP
 * Implementation of a Fact Table schema for identification analytics.
 */
const STORAGE_KEY = 'plantdex_warehouse_facts';

export const dataWarehouseService = {
  /**
   * Logs a new identification 'Fact' (DW-U1 Page 17)
   */
  logIdentificationFact: (plantData, uiConfidence) => {
    const facts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newFact = {
      timestamp: Date.now(),
      plantId: plantData.scientificName, // Foreign Key
      isEdible: plantData.isEdible,
      confidence: uiConfidence,
      location: "browser_local" // Proxy for Geography Dimension
    };
    facts.push(newFact);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(facts.slice(-100)));
  },

  /**
   * Simple Aggregation (Lightly Summarized Data - DW-U1 Page 5)
   * Summarizes identification history into a small Data Mart.
   */
  getSummaryMart: () => {
    const facts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const summary = facts.reduce((acc, f) => {
      acc.total++;
      if (f.isEdible) acc.edibleCount++;
      acc.avgConfidence += f.confidence;
      return acc;
    }, { total: 0, edibleCount: 0, avgConfidence: 0 });

    if (summary.total > 0) {
      summary.avgConfidence = Math.round(summary.avgConfidence / summary.total);
    }
    return summary;
  }
};
