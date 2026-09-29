/**
 * Environment configuration validation
 */

import { ConfigError } from '../utils/errors.js';

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = ['VITE_APP_NAME'] as const;

/**
 * Validate that required environment variables are set
 * @throws {ConfigError} If required variables are missing
 */
export function validateEnvironment(): void {
  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach((varName) => {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env file.`
    );
  }
}

/**
 * Get environment variable with fallback to default
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
export function getEnvVar(name: string, defaultValue = ''): string {
  return import.meta.env[name] ?? defaultValue;
}

/**
 * Get boolean environment variable
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Parsed boolean value
 */
export function getEnvBoolean(name: string, defaultValue = false): boolean {
  const value = import.meta.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

/**
 * Get numeric environment variable
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Parsed numeric value
 */
export function getEnvNumber(name: string, defaultValue = 0): number {
  const value = import.meta.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Check if API key is configured
 * @param varName - Environment variable name for the API key
 * @returns True if API key is configured
 */
export function isApiKeyConfigured(varName: string): boolean {
  const apiKey = import.meta.env[varName];
  return !!apiKey && apiKey.trim().length > 0;
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
};

export default {
  validateEnvironment,
  getEnvVar,
  getEnvBoolean,
  getEnvNumber,
  isApiKeyConfigured,
  config,
};