/**
 * Validation utilities for input data
 */

/**
 * Validate coordinates (latitude and longitude)
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateCoordinates(lat, lng) {
  const errors = []

  if (lat === undefined || lat === null) {
    errors.push('Latitude is required')
  } else if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a number')
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90')
  }

  if (lng === undefined || lng === null) {
    errors.push('Longitude is required')
  } else if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push('Longitude must be a number')
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate API key
 * @param {string} apiKey - API key to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' }
  }

  if (typeof apiKey !== 'string') {
    return { valid: false, error: 'API key must be a string' }
  }

  if (apiKey.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' }
  }

  return { valid: true, error: null }
}

/**
 * Validate date string
 * @param {string|Date} date - Date to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateDate(date) {
  if (!date) {
    return { valid: false, error: 'Date is required' }
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  return { valid: true, error: null }
}

/**
 * Validate quality score (0-10 scale)
 * @param {number} score - Quality score to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateQualityScore(score) {
  if (score === undefined || score === null) {
    return { valid: false, error: 'Quality score is required' }
  }

  if (typeof score !== 'number' || isNaN(score)) {
    return { valid: false, error: 'Quality score must be a number' }
  }

  if (score < 0 || score > 10) {
    return { valid: false, error: 'Quality score must be between 0 and 10' }
  }

  return { valid: true, error: null }
}

/**
 * Validate location object
 * @param {Object} location - Location object with name, lat, lng
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateLocation(location) {
  const errors = []

  if (!location || typeof location !== 'object') {
    errors.push('Location must be an object')
    return { valid: errors.length === 0, errors }
  }

  if (!location.name || typeof location.name !== 'string') {
    errors.push('Location name is required and must be a string')
  }

  const coordsValidation = validateCoordinates(location.lat, location.lng)
  if (!coordsValidation.valid) {
    errors.push(...coordsValidation.errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default {
  validateCoordinates,
  validateApiKey,
  validateDate,
  validateQualityScore,
  validateLocation,
}
