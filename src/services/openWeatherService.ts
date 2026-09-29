/**
 * OpenWeatherMap API Service
 * Provides weather data including cloud coverage and visibility
 * Documentation: https://openweathermap.org/api
 */

import { createApiClient } from './apiClient.js';
import { validateCoordinates } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';
import { API_BASE_URLS } from '../constants/apiConstants.js';
import { config } from '../config/environment.js';
import type { WeatherResponse, ForecastResponse } from './types.js';
import { calculateSunsetQuality } from '../utils/qualityUtils.js';

const OPENWEATHER_API_BASE = API_BASE_URLS.OPENWEATHER;
const API_KEY = config.openWeatherApiKey;

const openWeatherClient = createApiClient(OPENWEATHER_API_BASE);

/**
 * Get current weather data for a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Weather data
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherResponse> {
  // Validate coordinates
  const validation = validateCoordinates(lat, lng);
  if (!validation.valid) {
    throw new ValidationError('Invalid coordinates', validation.errors);
  }

  if (!API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    return {
      success: false,
      error: 'API key not configured',
      data: null,
    };
  }

  try {
    const response = await openWeatherClient.get<{
      main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
      };
      visibility: number;
      clouds: { all: number };
      weather: Array<{ main: string; description: string }>;
      wind: { speed: number; deg: number };
      sys: { sunrise: number; sunset: number };
    }>('/weather', {
      lat: lat.toString(),
      lon: lng.toString(),
      appid: API_KEY,
      units: 'metric', // Celsius
    });

    const data = response.data;

    return {
      success: true,
      data: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility, // meters
        cloudCoverage: data.clouds.all, // percentage
        weatherCondition: data.weather[0].main,
        weatherDescription: data.weather[0].description,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Get weather forecast for a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Forecast data (5 days / 3 hour intervals)
 */
export async function getWeatherForecast(lat: number, lng: number): Promise<ForecastResponse> {
  // Validate coordinates
  const validation = validateCoordinates(lat, lng);
  if (!validation.valid) {
    throw new ValidationError('Invalid coordinates', validation.errors);
  }

  if (!API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    return {
      success: false,
      error: 'API key not configured',
      data: null,
    };
  }

  try {
    const response = await openWeatherClient.get<{
      city: { name: string; country: string; timezone: number };
      list: Array<{
        dt: number;
        main: { temp: number; feels_like: number; humidity: number; pressure: number };
        clouds: { all: number };
        weather: Array<{ main: string; description: string }>;
        wind: { speed: number };
        pop: number;
      }>;
    }>('/forecast', {
      lat: lat.toString(),
      lon: lng.toString(),
      appid: API_KEY,
      units: 'metric',
    });

    const data = response.data;

    // Process forecast data to extract relevant information
    const forecast = data.list.map((item) => ({
      datetime: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      cloudCoverage: item.clouds.all,
      weatherCondition: item.weather[0].main,
      weatherDescription: item.weather[0].description,
      windSpeed: item.wind.speed,
      pop: item.pop, // Probability of precipitation
    }));

    return {
      success: true,
      data: {
        city: data.city.name,
        country: data.city.country,
        timezone: data.city.timezone,
        forecast,
      },
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Calculate sunset quality score based on weather conditions
 * Re-export from qualityUtils for backward compatibility
 */
export { calculateSunsetQuality } from '../utils/qualityUtils.js';

export default {
  getCurrentWeather,
  getWeatherForecast,
  calculateSunsetQuality,
};