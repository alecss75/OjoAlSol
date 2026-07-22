/**
 * Location Service
 * Handles geolocation and position management
 */

/**
 * Get current user location using browser Geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location data with lat, lng, and accuracy
 */
export async function getCurrentLocation(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes cache
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          }
        });
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        reject(new Error(errorMessage));
      },
      mergedOptions
    );
  });
}

/**
 * Watch user location continuously
 * @param {Function} callback - Function to call on position update
 * @param {Object} options - Geolocation options
 * @returns {Function} Cancel watch function
 */
export function watchLocation(callback, options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        success: true,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
      });
    },
    (error) => {
      callback({
        success: false,
        error: error.message
      });
    },
    mergedOptions
  );

  // Return cancel function
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Format coordinates as degrees, minutes, seconds
 * @param {number} decimal - Decimal degrees
 * @param {string} type - 'lat' or 'lng'
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(decimal, type) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  let direction;
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Convert coordinates to human-readable format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinate string
 */
export function coordinatesToString(lat, lng) {
  const latFormatted = formatCoordinates(lat, 'lat');
  const lngFormatted = formatCoordinates(lng, 'lng');
  return `${latFormatted}, ${lngFormatted}`;
}

export default {
  getCurrentLocation,
  watchLocation,
  formatCoordinates,
  coordinatesToString
};
