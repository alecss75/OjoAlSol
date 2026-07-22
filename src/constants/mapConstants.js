/**
 * Map constants for geographic and visualization settings
 */

/**
 * Default map center coordinates (can be overridden by user location)
 */
export const DEFAULT_MAP_CENTER = {
  lat: 40.4168,
  lng: -3.7038,
}

/**
 * Default zoom level for the map
 */
export const DEFAULT_ZOOM_LEVEL = 12

/**
 * Minimum and maximum zoom levels
 */
export const ZOOM_LIMITS = {
  MIN: 3,
  MAX: 18,
}

/**
 * Default radius for searching nearby locations in meters
 */
export const SEARCH_RADIUS_M = 5000

/**
 * Maximum number of locations to display on map
 */
export const MAX_LOCATIONS_DISPLAY = 20

/**
 * Map marker colors based on quality
 */
export const MARKER_COLORS = {
  HIGH: '#22c55e',    // green
  MEDIUM: '#eab308',  // yellow
  LOW: '#ef4444',     // red
}

/**
 * Earth radius in kilometers for distance calculations
 */
export const EARTH_RADIUS_KM = 6371

export default {
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM_LEVEL,
  ZOOM_LIMITS,
  SEARCH_RADIUS_M,
  MAX_LOCATIONS_DISPLAY,
  MARKER_COLORS,
  EARTH_RADIUS_KM,
}
