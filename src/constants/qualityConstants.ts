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
} as const;

/**
 * Sunset quality score thresholds (0-10 scale)
 */
export const SUNSET_QUALITY_THRESHOLDS = {
  EXCELLENT: { label: 'Excellent', min: 9, max: 10 },
  GOOD: { label: 'Good', min: 7, max: 8.9 },
  FAIR: { label: 'Fair', min: 4, max: 6.9 },
  POOR: { label: 'Poor', min: 0, max: 3.9 },
} as const;

/**
 * Cloud coverage impact on sunset quality
 */
export const CLOUD_COVERAGE_OPTIMAL = {
  MIN: 20,
  MAX: 60,
} as const;

/**
 * Visibility thresholds in meters
 */
export const VISIBILITY_THRESHOLDS = {
  EXCELLENT: 10000,
  GOOD: 5000,
  POOR: 3000,
} as const;

/**
 * Precipitation probability thresholds
 */
export const PRECIPITATION_THRESHOLDS = {
  HIGH: 0.5,
  MODERATE: 0.2,
} as const;

/**
 * Get quality color based on score (0-10 scale)
 * @param score - Quality score (0-10)
 * @returns Quality color class
 */
export function getQualityColor(score: number): 'high' | 'medium' | 'low' {
  if (score >= SUNSET_QUALITY_THRESHOLDS.EXCELLENT.min) {
    return 'high';
  }
  if (score >= SUNSET_QUALITY_THRESHOLDS.GOOD.min) {
    return 'medium';
  }
  return 'low';
}

export type QualityLabel = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface QualityThreshold {
  label: QualityLabel;
  min: number;
  max: number;
}