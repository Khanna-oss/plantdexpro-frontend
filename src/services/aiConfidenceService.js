
export const aiConfidenceService = {
  calculateScore: (baseScore, dataConsistency, source) => {
    // baseScore: 0 to 1
    // dataConsistency: 0 to 1 (checks if fields are present and non-generic)
    let score = baseScore * 100;
    
    // Weighted adjustment
    if (dataConsistency < 0.5) score -= 20;
    if (source === 'vision') score += 5;
    
    return Math.min(Math.max(Math.round(score), 0), 100);
  },

  /**
   * Softened hallucination check (DW-U2 Preprocessing Concept)
   * Ensures we don't reject valid edible plants that naturally contain vitamins.
   */
  detectHallucination: (text) => {
    const suspiciousPatterns = [
      /this plant is very healthy/i,
      /contains many mysterious nutrients/i,
      /cure all diseases/i,
      /miracle plant/i
    ];
    
    let hitCount = 0;
    suspiciousPatterns.forEach(p => {
      if (p.test(text)) hitCount++;
    });

    // Only reject if it sounds like a "miracle cure" or uses non-scientific "mystery" language
    return hitCount >= 1; 
  }
};
