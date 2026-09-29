/**
 * Spot quality calculation utilities
 * Unified quality calculation for spots based on category, distance, and weather
 */

import type { EnrichedSpot, QualityFactors } from '../services/types.js';

/**
 * Calculate spot quality score (0-10) based on multiple factors
 * @param spot - The spot to evaluate
 * @param weatherQuality - Current weather quality (0-10 scale)
 * @returns Quality score (0-10)
 */
export function calculateSpotQuality(
  spot: EnrichedSpot,
  weatherQuality: QualityFactors | null
): number {
  let score = 0;

  // Category (max 30 points -> 3.0 on 0-10 scale)
  switch (spot.category) {
    case 'beach':
      score += 30;
      break;
    case 'viewpoint':
      score += 25;
      break;
    case 'park':
      score += 15;
      break;
    default:
      score += 5;
  }

  // Distance (max 20 points -> 2.0 on 0-10 scale)
  const distanceKm = parseFloat(spot.distanceKm) || 999;
  if (distanceKm < 2) score += 20;
  else if (distanceKm < 5) score += 15;
  else if (distanceKm < 10) score += 10;
  else if (distanceKm < 20) score += 5;

  // Weather quality (max 50 points -> 5.0 on 0-10 scale)
  if (weatherQuality && typeof weatherQuality.score === 'number') {
    score += weatherQuality.score * 0.5;
  } else {
    score += 25; // Neutral fallback (2.5 on 0-10)
  }

  // Add a tiny bit of pseudo-random variation based on ID to break ties
  const idNum = typeof spot.id === 'string' ? spot.id.charCodeAt(0) : (spot.id as number) || 0;
  score += idNum % 4; // adds 0-3 points

  // Convert to 0-10 scale and clamp
  return Math.min(10, Math.max(0, score / 10));
}

/**
 * Get quality label from score
 */
export function getQualityLabel(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Poor';
}

/**
 * Get quality color class from score
 */
export function getQualityColorClass(score: number): 'high' | 'medium' | 'low' {
  if (score >= 9) return 'high';
  if (score >= 7) return 'medium';
  return 'low';
}