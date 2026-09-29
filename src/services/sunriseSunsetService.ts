/**
 * Sunrise-Sunset API Service
 * Provides sunset times, sunrise times, and solar position data
 * Documentation: https://sunrise-sunset.org/api
 */

import { get } from './apiClient.js';
import type { SunTimesData, GoldenHourData, SunTimesResponse, SolarPositionResponse } from './types.js';
import { API_BASE_URLS } from '../constants/apiConstants.js';

const SUNRISE_SUNSET_API_BASE = API_BASE_URLS.SUNRISE_SUNSET;

const sunriseSunsetClient = {
  get: <T>(endpoint: string, params?: Record<string, string>) => get<T>(SUNRISE_SUNSET_API_BASE, params),
};

/**
 * Get sunset and sunrise times for a specific location and date
 * @param lat - Latitude
 * @param lng - Longitude
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns Sunset/sunrise data
 */
export async function getSunTimes(
  lat: number,
  lng: number,
  date: string | null = null
): Promise<SunTimesResponse> {
  const params: Record<string, string> = {
    lat: lat.toString(),
    lng: lng.toString(),
    formatted: '0', // Return raw data without formatting
  };

  if (date) {
    params.date = date;
  } else {
    params.date = 'today';
  }

  try {
    const response = await sunriseSunsetClient.get<{ results: SunTimesData; timezone: string }>('', params);

    if (response.data.status !== 'OK') {
      throw new Error(`Sunrise-Sunset API returned error: ${response.data.status}`);
    }

    return {
      success: true,
      data: response.data.results,
      timezone: response.data.timezone,
    };
  } catch (error) {
    console.error('Error fetching sun times:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Calculate golden hour times (hour before sunset)
 * @param sunsetTime - Sunset time in ISO format
 * @returns Golden hour start and end times
 */
export function calculateGoldenHour(sunsetTime: string): GoldenHourData {
  const sunset = new Date(sunsetTime);
  const goldenHourStart = new Date(sunset.getTime() - 60 * 60 * 1000); // 1 hour before

  return {
    start: goldenHourStart.toISOString(),
    end: sunset.toISOString(),
    duration: 60, // minutes
  };
}

/**
 * Get solar position data including azimuth
 * @param lat - Latitude
 * @param lng - Longitude
 * @param date - Date in YYYY-MM-DD format
 * @returns Solar position data
 */
export async function getSolarPosition(
  lat: number,
  lng: number,
  date: string | null = null
): Promise<SolarPositionResponse> {
  const result = await getSunTimes(lat, lng, date);

  if (!result.success || !result.data) {
    return { success: false, error: result.error, data: null };
  }

  const { data } = result;

  return {
    success: true,
    data: {
      sunsetAzimuth: data.sunsetAzimuth ?? 0,
      sunriseAzimuth: data.sunriseAzimuth ?? 0,
      solarNoon: data.solarNoon,
      dayLength: data.dayLength,
      civilTwilightBegin: data.civilTwilightBegin,
      civilTwilightEnd: data.civilTwilightEnd,
      nauticalTwilightBegin: data.nauticalTwilightBegin,
      nauticalTwilightEnd: data.nauticalTwilightEnd,
      astronomicalTwilightBegin: data.astronomicalTwilightBegin,
      astronomicalTwilightEnd: data.astronomicalTwilightEnd,
    },
  };
}

export default {
  getSunTimes,
  getSolarPosition,
  calculateGoldenHour,
};