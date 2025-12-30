
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
   * Refined hallucination check (DW-U2)
   * Ensures we filter dangerous misinformation while allowing scientific descriptions.
   */
  detectHallucination: (text) => {
    const dangerousPatterns = [
      /mysterious nutrients that cure all/i,
      /secret botanical miracle/i,
      /magic properties/i,
      /scientific data is intentionally hidden/i
    ];
    
    // Only block if it hits truly suspicious, non-scientific "conspiracy" or "magic" language
    return dangerousPatterns.some(p => p.test(text));
  }
};
