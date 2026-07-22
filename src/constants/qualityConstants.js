/**
 * Quality constants for UV index and sunset quality scores
 */

/**
 * UV Index quality levels and their corresponding colors
 */
export const UV_QUALITY_LEVELS = {
  LOW: { label: 'Low', color: 'low', min: 0, max: 2 },
  MODERATE: { label: 'Moderate', color: 'medium', min: 3, max: 5 },
  HIGH: { label: 'High', color: 'high', min: 6, max: 7 },
  VERY_HIGH: { label: 'Very High', color: 'very-high', min: 8, max: 10 },
  EXTREME: { label: 'Extreme', color: 'extreme', min: 11, max: 15 },
}

/**
 * Sunset quality score thresholds (0-10 scale)
 */
export const SUNSET_QUALITY_THRESHOLDS = {
  EXCELLENT: { label: 'Excellent', min: 9, max: 10 },
  GOOD: { label: 'Good', min: 7, max: 8.9 },
  FAIR: { label: 'Fair', min: 4, max: 6.9 },
  POOR: { label: 'Poor', min: 0, max: 3.9 },
}

/**
 * Cloud coverage impact on sunset quality
 */
export const CLOUD_COVERAGE_OPTIMAL = {
  MIN: 20,
  MAX: 60,
}

/**
 * Visibility thresholds in meters
 */
export const VISIBILITY_THRESHOLDS = {
  EXCELLENT: 10000,
  GOOD: 5000,
  POOR: 3000,
}

/**
 * Precipitation probability thresholds
 */
export const PRECIPITATION_THRESHOLDS = {
  HIGH: 0.5,
  MODERATE: 0.2,
}

/**
 * Get quality color based on score
 * @param {number} score - Quality score (0-10)
 * @returns {string} Quality color class
 */
export function getQualityColor(score) {
  if (score >= SUNSET_QUALITY_THRESHOLDS.EXCELLENT.min) {
    return 'high'
  }
  if (score >= SUNSET_QUALITY_THRESHOLDS.GOOD.min) {
    return 'medium'
  }
  return 'low'
}

export default {
  UV_QUALITY_LEVELS,
  SUNSET_QUALITY_THRESHOLDS,
  CLOUD_COVERAGE_OPTIMAL,
  VISIBILITY_THRESHOLDS,
  PRECIPITATION_THRESHOLDS,
  getQualityColor,
}
