/**
 * Validation utilities for input data
 */

/**
 * Validate coordinates (latitude and longitude)
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns Validation result
 */
export function validateCoordinates(lat: unknown, lng: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (lat === undefined || lat === null) {
    errors.push('Latitude is required');
  } else if (typeof lat !== 'number' || Number.isNaN(lat)) {
    errors.push('Latitude must be a number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (lng === undefined || lng === null) {
    errors.push('Longitude is required');
  } else if (typeof lng !== 'number' || Number.isNaN(lng)) {
    errors.push('Longitude must be a number');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate API key
 * @param apiKey - API key to validate
 * @returns Validation result
 */
export function validateApiKey(apiKey: unknown): { valid: boolean; error: string | null } {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (typeof apiKey !== 'string') {
    return { valid: false, error: 'API key must be a string' };
  }

  if (apiKey.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  return { valid: true, error: null };
}

/**
 * Validate date string
 * @param date - Date to validate
 * @returns Validation result
 */
export function validateDate(date: unknown): { valid: boolean; error: string | null } {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date as string | number | Date);
  if (Number.isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  return { valid: true, error: null };
}

/**
 * Validate quality score (0-10 scale)
 * @param score - Quality score to validate
 * @returns Validation result
 */
export function validateQualityScore(score: unknown): { valid: boolean; error: string | null } {
  if (score === undefined || score === null) {
    return { valid: false, error: 'Quality score is required' };
  }

  if (typeof score !== 'number' || Number.isNaN(score)) {
    return { valid: false, error: 'Quality score must be a number' };
  }

  if (score < 0 || score > 10) {
    return { valid: false, error: 'Quality score must be between 0 and 10' };
  }

  return { valid: true, error: null };
}

/**
 * Validate location object
 * @param location - Location object with name, lat, lng
 * @returns Validation result
 */
export interface LocationInput {
  name: string;
  lat: number;
  lng: number;
}

export function validateLocation(location: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!location || typeof location !== 'object') {
    errors.push('Location must be an object');
    return { valid: errors.length === 0, errors };
  }

  const loc = location as Record<string, unknown>;

  if (!loc.name || typeof loc.name !== 'string') {
    errors.push('Location name is required and must be a string');
  }

  const coordsValidation = validateCoordinates(loc.lat, loc.lng);
  if (!coordsValidation.valid) {
    errors.push(...coordsValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}