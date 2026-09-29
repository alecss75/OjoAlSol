/**
 * Centralized API client with timeout, retries, and error handling
 */

import {
  API_TIMEOUT_MS,
  MAX_API_RETRIES,
  RETRY_DELAY_MS,
} from '../constants/apiConstants.js';
import { ApiError, TimeoutError, NetworkError, type AppErrorType } from '../utils/errors.js';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  if (error instanceof ApiError) {
    // Retry on 429 (rate limit) and 5xx errors
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  return false;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = API_TIMEOUT_MS, signal, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine with existing signal if provided
  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: combinedSignal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError(`Request timeout after ${timeout}ms`);
    }
    throw new NetworkError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Core request function with retries
 */
export async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { retries = MAX_API_RETRIES, retryDelay = RETRY_DELAY_MS, ...fetchOptions } = options;

  let lastError: AppErrorType | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      if (!response.ok) {
        const error = new ApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status
        );
        // Don't retry on 4xx errors (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw error;
        }
        throw error;
      }

      const data = await response.json();
      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt or error is not retryable, throw
      if (attempt === retries || !isRetryableError(lastError)) {
        throw lastError;
      }

      // Wait before retry with exponential backoff
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

/**
 * GET request helper
 */
export async function get<T>(url: string, params?: Record<string, string>, options?: RequestOptions): Promise<ApiResponse<T>> {
  const urlObj = new URL(url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });
  }
  return request<T>(urlObj.toString(), { method: 'GET', ...options });
}

/**
 * POST request helper
 */
export async function post<T>(url: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * Create a typed API client for a base URL
 */
export function createApiClient(baseUrl: string) {
  return {
    get: <T>(endpoint: string, params?: Record<string, string>, options?: RequestOptions) =>
      get<T>(`${baseUrl}${endpoint}`, params, options),
    post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
      post<T>(`${baseUrl}${endpoint}`, body, options),
    request: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(`${baseUrl}${endpoint}`, options),
  };
}