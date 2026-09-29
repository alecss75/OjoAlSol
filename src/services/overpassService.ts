/**
 * Overpass API (OpenStreetMap) Service
 * Finds viewpoints, parks, beaches, and other scenic locations
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

import { post } from './apiClient.js';
import type { BaseSpot, SpotsGrouped, FindSpotsResult } from './types.js';
import { OVERPASS_ENDPOINTS } from './overpassConstants.js';

/**
 * Build Overpass QL query for finding spots
 */
function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  types: Array<{ key: string; value: string }>
): string {
  const clauses = types
    .map(({ key, value }) => `
      node["${key}"="${value}"](around:${radius},${lat},${lng});
      way["${key}"="${value}"](around:${radius},${lat},${lng});
      relation["${key}"="${value}"](around:${radius},${lat},${lng});`)
    .join('\n');

  return `
    [out:json][timeout:25];
    (${clauses}
    );
    out center;
  `;
}

/**
 * Fetch with retry across multiple endpoints
 */
async function fetchWithRetry(query: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const endpoint = OVERPASS_ENDPOINTS[i % OVERPASS_ENDPOINTS.length];
    try {
      const response = await post(endpoint, query, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.ok) {
        return response as unknown as Response;
      }

      lastError = new Error(`Overpass API error: ${response.status}`);
      // If it's a 4xx error (other than 429 Too Many Requests), don't retry
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw lastError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * Math.pow(2, i)));
    }
  }

  throw lastError;
}

/**
 * Parse Overpass API response elements into spots
 */
function parseElements(elements: unknown[]): BaseSpot[] {
  return elements
    .map((element) => {
      const el = element as {
        id: number;
        type: 'node' | 'way' | 'relation';
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags: Record<string, string>;
      };

      let category: BaseSpot['category'];
      if (el.tags.tourism === 'viewpoint') {
        category = 'viewpoint';
      } else if (el.tags.leisure === 'park') {
        category = 'park';
      } else if (el.tags.natural === 'beach') {
        category = 'beach';
      } else {
        category = 'other';
      }

      return {
        id: el.id,
        type: el.type,
        category,
        name: el.tags.name || `Unnamed ${category}`,
        latitude: el.lat ?? el.center?.lat ?? 0,
        longitude: el.lon ?? el.center?.lon ?? 0,
        description: el.tags.description,
        tags: el.tags,
      };
    })
    .filter((item) => item.latitude && item.longitude);
}

/**
 * Find scenic viewpoints near a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @returns List of viewpoints
 */
export async function findViewpoints(
  lat: number,
  lng: number,
  radius = 5000
): Promise<FindSpotsResult> {
  const query = buildOverpassQuery(lat, lng, radius, [{ key: 'tourism', value: 'viewpoint' }]);

  try {
    const response = await fetchWithRetry(query);
    const data = await response.json();

    const spots = parseElements(data.elements);
    return {
      success: true,
      data: {
        viewpoints: spots,
        parks: [],
        beaches: [],
        all: spots,
      },
      count: spots.length,
      summary: { viewpoints: spots.length, parks: 0, beaches: 0 },
    };
  } catch (error) {
    console.error('Error fetching viewpoints:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { viewpoints: [], parks: [], beaches: [], all: [] },
      count: 0,
    };
  }
}

/**
 * Find parks near a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @returns List of parks
 */
export async function findParks(
  lat: number,
  lng: number,
  radius = 5000
): Promise<FindSpotsResult> {
  const query = buildOverpassQuery(lat, lng, radius, [{ key: 'leisure', value: 'park' }]);

  try {
    const response = await fetchWithRetry(query);
    const data = await response.json();

    const spots = parseElements(data.elements);
    return {
      success: true,
      data: {
        viewpoints: [],
        parks: spots,
        beaches: [],
        all: spots,
      },
      count: spots.length,
      summary: { viewpoints: 0, parks: spots.length, beaches: 0 },
    };
  } catch (error) {
    console.error('Error fetching parks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { viewpoints: [], parks: [], beaches: [], all: [] },
      count: 0,
    };
  }
}

/**
 * Find beaches near a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @returns List of beaches
 */
export async function findBeaches(
  lat: number,
  lng: number,
  radius = 5000
): Promise<FindSpotsResult> {
  const query = buildOverpassQuery(lat, lng, radius, [{ key: 'natural', value: 'beach' }]);

  try {
    const response = await fetchWithRetry(query);
    const data = await response.json();

    const spots = parseElements(data.elements);
    return {
      success: true,
      data: {
        viewpoints: [],
        parks: [],
        beaches: spots,
        all: spots,
      },
      count: spots.length,
      summary: { viewpoints: 0, parks: 0, beaches: spots.length },
    };
  } catch (error) {
    console.error('Error fetching beaches:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { viewpoints: [], parks: [], beaches: [], all: [] },
      count: 0,
    };
  }
}

/**
 * Find all sunset spots (viewpoints, parks, and beaches) near a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @returns Combined list of all sunset spots
 */
export async function findAllSunsetSpots(
  lat: number,
  lng: number,
  radius = 5000
): Promise<FindSpotsResult> {
  const query = buildOverpassQuery(lat, lng, radius, [
    { key: 'tourism', value: 'viewpoint' },
    { key: 'leisure', value: 'park' },
    { key: 'natural', value: 'beach' },
  ]);

  try {
    const response = await fetchWithRetry(query);
    const data = await response.json();

    const spots = parseElements(data.elements);

    // Group by category
    const grouped: SpotsGrouped = {
      viewpoints: spots.filter((s) => s.category === 'viewpoint'),
      parks: spots.filter((s) => s.category === 'park'),
      beaches: spots.filter((s) => s.category === 'beach'),
      all: spots,
    };

    return {
      success: true,
      data: grouped,
      count: spots.length,
      summary: {
        viewpoints: grouped.viewpoints.length,
        parks: grouped.parks.length,
        beaches: grouped.beaches.length,
      },
    };
  } catch (error) {
    console.error('Error fetching sunset spots:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { viewpoints: [], parks: [], beaches: [], all: [] },
      count: 0,
    };
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  findViewpoints,
  findParks,
  findBeaches,
  findAllSunsetSpots,
  calculateDistance,
};