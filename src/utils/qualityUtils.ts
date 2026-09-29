/**
 * Quality utilities for UV index and sunset quality calculations
 */

import {
  SUNSET_QUALITY_THRESHOLDS,
  CLOUD_COVERAGE_OPTIMAL,
  VISIBILITY_THRESHOLDS,
  PRECIPITATION_THRESHOLDS,
  type QualityLabel,
} from '../constants/qualityConstants.js';

export interface WeatherData {
  cloudCoverage?: number;
  visibility?: number;
  pop?: number;
  humidity?: number;
  temperature?: number;
  windSpeed?: number;
}

export interface QualityFactors {
  score: number;
  quality: QualityLabel;
  factors: string[];
}

/**
 * Calculate sunset quality score based on weather conditions
 * @param weatherData - Weather data from API
 * @returns Quality assessment (0-100 scale, quality label, factors)
 */
export function calculateSunsetQuality(weatherData: WeatherData | null): QualityFactors {
  if (!weatherData) {
    return { score: 0, quality: 'Unknown', factors: [] };
  }

  let score = 100;
  const factors: string[] = [];

  // Cloud coverage impact (optimal: 20-60%)
  const cloudCoverage = weatherData.cloudCoverage ?? 0;
  if (cloudCoverage < CLOUD_COVERAGE_OPTIMAL.MIN) {
    score -= 20;
    factors.push('Clear sky - good visibility but less dramatic colors');
  } else if (cloudCoverage > 80) {
    score -= 40;
    factors.push('Heavy cloud cover - may obscure sunset');
  } else if (cloudCoverage >= CLOUD_COVERAGE_OPTIMAL.MIN && cloudCoverage <= CLOUD_COVERAGE_OPTIMAL.MAX) {
    score += 10;
    factors.push('Optimal cloud coverage for colorful sunset');
  }

  // Visibility impact
  const visibility = weatherData.visibility ?? 10000; // meters
  if (visibility < VISIBILITY_THRESHOLDS.POOR) {
    score -= 30;
    factors.push('Poor visibility');
  } else if (visibility >= VISIBILITY_THRESHOLDS.POOR && visibility < VISIBILITY_THRESHOLDS.GOOD) {
    score -= 10;
    factors.push('Moderate visibility');
  } else {
    factors.push('Excellent visibility');
  }

  // Precipitation probability
  const pop = weatherData.pop ?? 0;
  if (pop > PRECIPITATION_THRESHOLDS.HIGH) {
    score -= 30;
    factors.push('High chance of precipitation');
  } else if (pop > PRECIPITATION_THRESHOLDS.MODERATE) {
    score -= 15;
    factors.push('Some chance of precipitation');
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Convert to 0-10 scale
  const normalizedScore = Math.round((score / 100) * 10 * 10) / 10;

  let quality: QualityLabel;
  if (normalizedScore >= SUNSET_QUALITY_THRESHOLDS.EXCELLENT.min) {
    quality = SUNSET_QUALITY_THRESHOLDS.EXCELLENT.label;
  } else if (normalizedScore >= SUNSET_QUALITY_THRESHOLDS.GOOD.min) {
    quality = SUNSET_QUALITY_THRESHOLDS.GOOD.label;
  } else if (normalizedScore >= SUNSET_QUALITY_THRESHOLDS.FAIR.min) {
    quality = SUNSET_QUALITY_THRESHOLDS.FAIR.label;
  } else {
    quality = SUNSET_QUALITY_THRESHOLDS.POOR.label;
  }

  return { score: normalizedScore, quality, factors };
}

/**
 * Get quality color class based on score
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

/**
 * Format quality score for display
 * @param score - Quality score
 * @returns Formatted score
 */
export function formatQualityScore(score: number): string {
  return score.toFixed(1);
}