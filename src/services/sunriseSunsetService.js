/**
 * Sunrise-Sunset API Service
 * Provides sunset times, sunrise times, and solar position data
 * Documentation: https://sunrise-sunset.org/api
 */

const SUNRISE_SUNSET_API_BASE = 'https://api.sunrise-sunset.org/json';

/**
 * Get sunset and sunrise times for a specific location and date
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Promise<Object>} Sunset/sunrise data
 */
export async function getSunTimes(lat, lng, date = null) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    formatted: '0' // Return raw data without formatting
  });

  if (date) {
    params.append('date', date);
  } else {
    params.append('date', 'today');
  }

  try {
    const response = await fetch(`${SUNRISE_SUNSET_API_BASE}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Sunrise-Sunset API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Sunrise-Sunset API returned error: ${data.status}`);
    }

    return {
      success: true,
      data: data.results,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error fetching sun times:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Calculate golden hour times (hour before sunset)
 * @param {string} sunsetTime - Sunset time in ISO format
 * @returns {Object} Golden hour start and end times
 */
export function calculateGoldenHour(sunsetTime) {
  const sunset = new Date(sunsetTime);
  const goldenHourStart = new Date(sunset.getTime() - 60 * 60 * 1000); // 1 hour before
  
  return {
    start: goldenHourStart.toISOString(),
    end: sunset.toISOString(),
    duration: 60 // minutes
  };
}

/**
 * Get solar position data including azimuth
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Solar position data
 */
export async function getSolarPosition(lat, lng, date = null) {
  const result = await getSunTimes(lat, lng, date);
  
  if (!result.success) {
    return result;
  }

  const { data } = result;
  
  return {
    success: true,
    data: {
      sunsetAzimuth: data.sunset_azimuth,
      sunriseAzimuth: data.sunrise_azimuth,
      solarNoon: data.solar_noon,
      dayLength: data.day_length,
      civilTwilightBegin: data.civil_twilight_begin,
      civilTwilightEnd: data.civil_twilight_end,
      nauticalTwilightBegin: data.nautical_twilight_begin,
      nauticalTwilightEnd: data.nautical_twilight_end,
      astronomicalTwilightBegin: data.astronomical_twilight_begin,
      astronomicalTwilightEnd: data.astronomical_twilight_end
    }
  };
}

export default {
  getSunTimes,
  getSolarPosition,
  calculateGoldenHour
};
