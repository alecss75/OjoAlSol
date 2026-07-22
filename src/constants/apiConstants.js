/**
 * API constants for external service integration
 */

/**
 * Base URLs for external APIs
 */
export const API_BASE_URLS = {
  OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
  SUNRISE_SUNSET: 'https://api.sunrise-sunset.org/json',
  OVERPASS: 'https://overpass-api.de/api/interpreter',
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  OPENWEATHER: {
    CURRENT_WEATHER: '/weather',
    FORECAST: '/forecast',
  },
  SUNRISE_SUNSET: {
    TIMES: '?',
  },
}

/**
 * Default timeout for API requests in milliseconds
 */
export const API_TIMEOUT_MS = 10000

/**
 * Default radius for location-based queries in meters
 */
export const LOCATION_RADIUS_M = 5000

/**
 * Maximum number of retries for failed API requests
 */
export const MAX_API_RETRIES = 3

/**
 * Delay between retries in milliseconds
 */
export const RETRY_DELAY_MS = 1000

export default {
  API_BASE_URLS,
  API_ENDPOINTS,
  API_TIMEOUT_MS,
  LOCATION_RADIUS_M,
  MAX_API_RETRIES,
  RETRY_DELAY_MS,
}
