
/**
 * DW-U4 Integration: Classification & Ensemble
 * Logic for model evaluation and consensus voting.
 */
export const classificationEnsemble = {
  /**
   * Calculates accuracy metrics based on holdout samples (DW-U4 Page 16)
   */
  calculateMetrics: (predictions, actual) => {
    const tp = predictions.filter((p, i) => p === actual[i] && p === true).length;
    const fp = predictions.filter((p, i) => p !== actual[i] && p === true).length;
    const fn = predictions.filter((p, i) => p !== actual[i] && p === false).length;

    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    return { precision, recall, f1 };
  },

  /**
   * Ensemble Voting Strategy (DW-U4 Concept)
   * Takes results from multiple model runs and returns the majority consensus.
   */
  getMajorityVote: (results) => {
    const tally = {};
    results.forEach(r => {
      tally[r.name] = (tally[r.name] || 0) + 1;
    });
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return {
      consensus: sorted[0][0],
      agreement: sorted[0][1] / results.length
    };
  }
};
