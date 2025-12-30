
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

  detectHallucination: (text) => {
    const suspiciousPatterns = [
      /rich in vitamins/i,
      /various minerals/i,
      /contains nutrients/i,
      /good for health/i,
      /consult a doctor/i
    ];
    
    let hitCount = 0;
    suspiciousPatterns.forEach(p => {
      if (p.test(text)) hitCount++;
    });

    return hitCount >= 2; // Flag if multiple generic phrases found
  }
};
