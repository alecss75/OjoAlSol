/**
 * Location Service
 * Handles geolocation and position management
 * Uses Capacitor Geolocation on native, browser API on web
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position, type PositionOptions } from '@capacitor/geolocation';
import { LocationResponse, LocationData } from './types.js';

/**
 * Check if running on native platform (iOS/Android)
 */
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Convert Capacitor Position to LocationData
 */
function positionToLocationData(position: Position): LocationData {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude ?? null,
    heading: position.coords.heading ?? null,
    speed: position.coords.speed ?? null,
    timestamp: position.timestamp,
  };
}

/**
 * Get current user location
 * Uses Capacitor Geolocation on native, browser API on web
 * @param options - Geolocation options
 * @returns Location data with lat, lng, and accuracy
 */
export async function getCurrentLocation(options: PositionOptions = {}): Promise<LocationResponse> {
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes cache
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (isNative()) {
    try {
      const position = await Geolocation.getCurrentPosition(mergedOptions);
      return { success: true, data: positionToLocationData(position) };
    } catch (error) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unknown error occurred';
      }
      return { success: false, error: errorMessage };
    }
  }

  // Web fallback - use browser Geolocation API
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        resolve({ success: true, data: locationData });
      },
      (error) => {
        let errorMessage: string;
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
        resolve({ success: false, error: errorMessage });
      },
      mergedOptions
    );
  });
}

/**
 * Watch user location continuously
 * Uses Capacitor Geolocation on native, browser API on web
 * @param callback - Function to call on position update
 * @param options - Geolocation options
 * @returns Cancel watch function
 */
export function watchLocation(
  callback: (result: LocationResponse) => void,
  options: PositionOptions = {}
): () => void {
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (isNative()) {
    let watchId: string;

    Geolocation.watchPosition(mergedOptions, (position, err) => {
      if (err) {
        callback({ success: false, error: err.message });
      } else if (position) {
        callback({ success: true, data: positionToLocationData(position) });
      }
    }).then((id) => {
      watchId = id;
    });

    return async () => {
      if (watchId) {
        await Geolocation.clearWatch({ id: watchId });
      }
    };
  }

  // Web fallback
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
          timestamp: position.timestamp,
        },
      });
    },
    (error) => {
      callback({ success: false, error: error.message });
    },
    mergedOptions
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Format coordinates as degrees, minutes, seconds
 * @param decimal - Decimal degrees
 * @param type - 'lat' or 'lng'
 * @returns Formatted coordinates
 */
export function formatCoordinates(decimal: number, type: 'lat' | 'lng'): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  let direction: string;
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Convert coordinates to human-readable format
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinate string
 */
export function coordinatesToString(lat: number, lng: number): string {
  const latFormatted = formatCoordinates(lat, 'lat');
  const lngFormatted = formatCoordinates(lng, 'lng');
  return `${latFormatted}, ${lngFormatted}`;
}

/**
 * Request location permissions (native only)
 */
export async function requestLocationPermission(): Promise<'granted' | 'denied'> {
  if (isNative()) {
    const result = await Geolocation.requestPermissions();
    return result.location === 'granted' ? 'granted' : 'denied';
  }
  return 'granted'; // Web handles permission via browser prompt
}