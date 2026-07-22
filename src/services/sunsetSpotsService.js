/**
 * Sunset Spots Service
 * Combines all API services to find and rank sunset viewing locations
 */

import { getSunTimes, calculateGoldenHour } from './sunriseSunsetService';
import { getCurrentWeather, calculateSunsetQuality } from './openWeatherService';
import { findAllSunsetSpots, calculateDistance } from './overpassService';

/**
 * Find and rank sunset spots near a location
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {number} radius - Search radius in meters (default: 10000)
 * @returns {Promise<Object>} Ranked list of sunset spots with quality scores
 */
export async function findBestSunsetSpots(lat, lng, radius = 10000) {
  try {
    // Fetch all data in parallel
    const [spotsResult, sunResult, weatherResult] = await Promise.all([
      findAllSunsetSpots(lat, lng, radius),
      getSunTimes(lat, lng),
      getCurrentWeather(lat, lng)
    ]);

    if (!spotsResult.success) {
      return {
        success: false,
        error: spotsResult.error,
        data: []
      };
    }

    const spots = spotsResult.data.all;
    
    // Calculate distance and enrich each spot
    const enrichedSpots = spots.map(spot => {
      const distance = calculateDistance(lat, lng, spot.latitude, spot.longitude);
      
      return {
        ...spot,
        distanceKm: distance.toFixed(2),
        distanceMeters: Math.round(distance * 1000)
      };
    });

    // Sort by distance (closest first)
    enrichedSpots.sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

    // Get sunset quality assessment
    let sunsetQuality = null;
    if (weatherResult.success && weatherResult.data) {
      sunsetQuality = calculateSunsetQuality(weatherResult.data);
    }

    return {
      success: true,
      data: {
        spots: enrichedSpots,
        count: enrichedSpots.length,
        summary: spotsResult.summary,
        sunData: sunResult.success ? sunResult.data : null,
        weather: weatherResult.success ? weatherResult.data : null,
        sunsetQuality
      }
    };
  } catch (error) {
    console.error('Error finding sunset spots:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Get detailed information for a specific sunset spot
 * @param {Object} spot - Spot data from findBestSunsetSpots
 * @returns {Promise<Object>} Detailed spot information
 */
export async function getSpotDetails(spot) {
  try {
    const [sunResult, weatherResult] = await Promise.all([
      getSunTimes(spot.latitude, spot.longitude),
      getCurrentWeather(spot.latitude, spot.longitude)
    ]);

    let goldenHour = null;
    if (sunResult.success && sunResult.data?.sunset) {
      goldenHour = calculateGoldenHour(sunResult.data.sunset);
    }

    let sunsetQuality = null;
    if (weatherResult.success && weatherResult.data) {
      sunsetQuality = calculateSunsetQuality(weatherResult.data);
    }

    return {
      success: true,
      data: {
        ...spot,
        sunData: sunResult.success ? sunResult.data : null,
        goldenHour,
        weather: weatherResult.success ? weatherResult.data : null,
        sunsetQuality
      }
    };
  } catch (error) {
    console.error('Error getting spot details:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Compare multiple spots for tomorrow's sunset
 * @param {Array} spots - Array of spot objects
 * @returns {Promise<Object>} Comparison data for all spots
 */
export async function compareSpotsForTomorrow(spots) {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const comparisons = await Promise.all(
      spots.map(async (spot) => {
        const [sunResult, weatherResult] = await Promise.all([
          getSunTimes(spot.latitude, spot.longitude, dateStr),
          getCurrentWeather(spot.latitude, spot.longitude)
        ]);

        let goldenHour = null;
        if (sunResult.success && sunResult.data?.sunset) {
          goldenHour = calculateGoldenHour(sunResult.data.sunset);
        }

        const sunsetQuality = weatherResult.success 
          ? calculateSunsetQuality(weatherResult.data)
          : { score: 0, quality: 'Unknown' };

        return {
          ...spot,
          sunData: sunResult.success ? sunResult.data : null,
          goldenHour,
          weather: weatherResult.success ? weatherResult.data : null,
          sunsetQuality
        };
      })
    );

    // Sort by sunset quality score
    comparisons.sort((a, b) => b.sunsetQuality.score - a.sunsetQuality.score);

    return {
      success: true,
      data: comparisons
    };
  } catch (error) {
    console.error('Error comparing spots:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

export default {
  findBestSunsetSpots,
  getSpotDetails,
  compareSpotsForTomorrow
};
