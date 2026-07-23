/**
 * Environment configuration validation
 */

import { ConfigError } from '../utils/errors.js'

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = [
  'VITE_APP_NAME',
]

/**
 * Validate that required environment variables are set
 * @throws {ConfigError} If required variables are missing
 */
export function validateEnvironment() {
  const missing = []

  REQUIRED_ENV_VARS.forEach((varName) => {
    const value = import.meta.env[varName]
    if (!value || value.trim() === '') {
      missing.push(varName)
    }
  })

  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env file.`
    )
  }
}

/**
 * Get environment variable with fallback to default
 * @param {string} name - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value or default
 */
export function getEnvVar(name, defaultValue = '') {
  return import.meta.env[name] ?? defaultValue
}

/**
 * Get boolean environment variable
 * @param {string} name - Environment variable name
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean} Parsed boolean value
 */
export function getEnvBoolean(name, defaultValue = false) {
  const value = import.meta.env[name]
  if (value === undefined) {
    return defaultValue
  }
  return value.toLowerCase() === 'true'
}

/**
 * Get numeric environment variable
 * @param {string} name - Environment variable name
 * @param {number} defaultValue - Default value if not set
 * @returns {number} Parsed numeric value
 */
export function getEnvNumber(name, defaultValue = 0) {
  const value = import.meta.env[name]
  if (value === undefined) {
    return defaultValue
  }
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Check if API key is configured
 * @param {string} varName - Environment variable name for the API key
 * @returns {boolean} True if API key is configured
 */
export function isApiKeyConfigured(varName) {
  const apiKey = import.meta.env[varName]
  return !!apiKey && apiKey.trim().length > 0
}

/**
 * Application configuration object
 */
export const config = {
  appName: getEnvVar('VITE_APP_NAME', 'OjoAlSol'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', false),
  openWeatherApiKey: getEnvVar('VITE_OPENWEATHER_API_KEY', ''),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
}

export default {
  validateEnvironment,
  getEnvVar,
  getEnvBoolean,
  getEnvNumber,
  isApiKeyConfigured,
  config,
}
