/**
 * Custom error classes for application-wide error handling
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.timestamp = new Date().toISOString()

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    }
  }
}

/**
 * API-related errors
 */
export class ApiError extends AppError {
  constructor(message, statusCode = 502, code = 'API_ERROR') {
    super(message, code, statusCode)
    this.name = 'ApiError'
  }
}

/**
 * Validation errors for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fieldErrors = []) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    }
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication failed', statusCode = 401) {
    super(message, 'AUTH_ERROR', statusCode)
    this.name = 'AuthError'
  }
}

/**
 * Configuration errors for environment/setup issues
 */
export class ConfigError extends AppError {
  constructor(message) {
    super(message, 'CONFIG_ERROR', 500)
    this.name = 'ConfigError'
  }
}

/**
 * Network/Connection errors
 */
export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 503)
    this.name = 'NetworkError'
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Timeout errors for API requests
 */
export class TimeoutError extends AppError {
  constructor(message = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 504)
    this.name = 'TimeoutError'
  }
}

export default {
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  ConfigError,
  NetworkError,
  NotFoundError,
  TimeoutError,
}
