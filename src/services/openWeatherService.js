/**
 * OpenWeatherMap API Service
 * Provides weather data including cloud coverage and visibility
 * Documentation: https://openweathermap.org/api
 */

const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Note: API key should be set via environment variable VITE_OPENWEATHER_API_KEY
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

/**
 * Get current weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(lat, lng) {
  if (!API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    return {
      success: false,
      error: 'API key not configured',
      data: null
    };
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    appid: API_KEY,
    units: 'metric' // Celsius
  });

  try {
    const response = await fetch(`${OPENWEATHER_API_BASE}/weather?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    
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
        sunset: new Date(data.sys.sunset * 1000).toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Get weather forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Forecast data (5 days / 3 hour intervals)
 */
export async function getWeatherForecast(lat, lng) {
  if (!API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    return {
      success: false,
      error: 'API key not configured',
      data: null
    };
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    appid: API_KEY,
    units: 'metric'
  });

  try {
    const response = await fetch(`${OPENWEATHER_API_BASE}/forecast?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process forecast data to extract relevant information
    const forecast = data.list.map(item => ({
      datetime: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      cloudCoverage: item.clouds.all,
      weatherCondition: item.weather[0].main,
      weatherDescription: item.weather[0].description,
      windSpeed: item.wind.speed,
      pop: item.pop // Probability of precipitation
    }));

    return {
      success: true,
      data: {
        city: data.city.name,
        country: data.city.country,
        timezone: data.city.timezone,
        forecast
      }
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Calculate sunset quality score based on weather conditions
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} Quality score and analysis
 */
export function calculateSunsetQuality(weatherData) {
  if (!weatherData) {
    return { score: 0, quality: 'Unknown', factors: [] };
  }

  let score = 100;
  const factors = [];

  // Cloud coverage impact (optimal: 20-60%)
  const cloudCoverage = weatherData.cloudCoverage || 0;
  if (cloudCoverage < 20) {
    score -= 20;
    factors.push('Clear sky - good visibility but less dramatic colors');
  } else if (cloudCoverage > 80) {
    score -= 40;
    factors.push('Heavy cloud cover - may obscure sunset');
  } else if (cloudCoverage >= 20 && cloudCoverage <= 60) {
    score += 10;
    factors.push('Optimal cloud coverage for colorful sunset');
  }

  // Visibility impact
  const visibility = weatherData.visibility || 10000; // meters
  if (visibility < 5000) {
    score -= 30;
    factors.push('Poor visibility');
  } else if (visibility >= 5000 && visibility < 10000) {
    score -= 10;
    factors.push('Moderate visibility');
  } else {
    factors.push('Excellent visibility');
  }

  // Precipitation probability
  const pop = weatherData.pop || 0;
  if (pop > 0.5) {
    score -= 30;
    factors.push('High chance of precipitation');
  } else if (pop > 0.2) {
    score -= 15;
    factors.push('Some chance of precipitation');
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  let quality;
  if (score >= 80) {
    quality = 'Excellent';
  } else if (score >= 60) {
    quality = 'Good';
  } else if (score >= 40) {
    quality = 'Fair';
  } else {
    quality = 'Poor';
  }

  return { score, quality, factors };
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  calculateSunsetQuality
};
