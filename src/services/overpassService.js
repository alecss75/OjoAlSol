/**
 * Overpass API (OpenStreetMap) Service
 * Finds viewpoints, parks, beaches, and other scenic locations
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

async function fetchWithRetry(query, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    const endpoint = OVERPASS_ENDPOINTS[i % OVERPASS_ENDPOINTS.length];
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: query
      });
      if (response.ok) {
        return response;
      }
      lastError = new Error(`Overpass API error: ${response.status}`);
      // If it's a 4xx error (other than 429 Too Many Requests), don't retry
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw lastError;
      }
    } catch (error) {
      lastError = error;
    }
    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500 * Math.pow(2, i)));
    }
  }
  throw lastError;
}
/**
 * Find scenic viewpoints near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Object>} List of viewpoints
 */
export async function findViewpoints(lat, lng, radius = 5000) {
  // Overpass QL query to find tourism=viewpoint
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="viewpoint"](around:${radius},${lat},${lng});
      way["tourism"="viewpoint"](around:${radius},${lat},${lng});
      relation["tourism"="viewpoint"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetchWithRetry(query);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const viewpoints = data.elements.map(element => ({
      id: element.id,
      type: element.type,
      name: element.tags.name || 'Unnamed Viewpoint',
      latitude: element.lat || element.center?.lat,
      longitude: element.lon || element.center?.lon,
      description: element.tags.description,
      website: element.tags.website,
      image: element.tags.image,
      tags: element.tags
    })).filter(item => item.latitude && item.longitude); // Filter out incomplete data

    return {
      success: true,
      data: viewpoints,
      count: viewpoints.length
    };
  } catch (error) {
    console.error('Error fetching viewpoints:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Find parks near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Object>} List of parks
 */
export async function findParks(lat, lng, radius = 5000) {
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      relation["leisure"="park"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetchWithRetry(query);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const parks = data.elements.map(element => ({
      id: element.id,
      type: element.type,
      name: element.tags.name || 'Unnamed Park',
      latitude: element.lat || element.center?.lat,
      longitude: element.lon || element.center?.lon,
      description: element.tags.description,
      website: element.tags.website,
      openingHours: element.tags.opening_hours,
      tags: element.tags
    })).filter(item => item.latitude && item.longitude);

    return {
      success: true,
      data: parks,
      count: parks.length
    };
  } catch (error) {
    console.error('Error fetching parks:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Find beaches near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Object>} List of beaches
 */
export async function findBeaches(lat, lng, radius = 5000) {
  const query = `
    [out:json][timeout:25];
    (
      node["natural"="beach"](around:${radius},${lat},${lng});
      way["natural"="beach"](around:${radius},${lat},${lng});
      relation["natural"="beach"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetchWithRetry(query);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const beaches = data.elements.map(element => ({
      id: element.id,
      type: element.type,
      name: element.tags.name || 'Unnamed Beach',
      latitude: element.lat || element.center?.lat,
      longitude: element.lon || element.center?.lon,
      description: element.tags.description,
      surface: element.tags.surface,
      tags: element.tags
    })).filter(item => item.latitude && item.longitude);

    return {
      success: true,
      data: beaches,
      count: beaches.length
    };
  } catch (error) {
    console.error('Error fetching beaches:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Find all sunset spots (viewpoints, parks, and beaches) near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Object>} Combined list of all sunset spots
 */
export async function findAllSunsetSpots(lat, lng, radius = 5000) {
  // Combined query for all three types
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="viewpoint"](around:${radius},${lat},${lng});
      way["tourism"="viewpoint"](around:${radius},${lat},${lng});
      relation["tourism"="viewpoint"](around:${radius},${lat},${lng});
      
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      relation["leisure"="park"](around:${radius},${lat},${lng});
      
      node["natural"="beach"](around:${radius},${lat},${lng});
      way["natural"="beach"](around:${radius},${lat},${lng});
      relation["natural"="beach"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetchWithRetry(query);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const spots = data.elements.map(element => {
      let category;
      if (element.tags.tourism === 'viewpoint') {
        category = 'viewpoint';
      } else if (element.tags.leisure === 'park') {
        category = 'park';
      } else if (element.tags.natural === 'beach') {
        category = 'beach';
      } else {
        category = 'other';
      }

      return {
        id: element.id,
        type: element.type,
        category,
        name: element.tags.name || `Unnamed ${category}`,
        latitude: element.lat || element.center?.lat,
        longitude: element.lon || element.center?.lon,
        description: element.tags.description,
        website: element.tags.website,
        image: element.tags.image,
        openingHours: element.tags.opening_hours,
        surface: element.tags.surface,
        tags: element.tags
      };
    }).filter(item => item.latitude && item.longitude);

    // Group by category
    const grouped = {
      viewpoints: spots.filter(s => s.category === 'viewpoint'),
      parks: spots.filter(s => s.category === 'park'),
      beaches: spots.filter(s => s.category === 'beach'),
      all: spots
    };

    return {
      success: true,
      data: grouped,
      count: spots.length,
      summary: {
        viewpoints: grouped.viewpoints.length,
        parks: grouped.parks.length,
        beaches: grouped.beaches.length
      }
    };
  } catch (error) {
    console.error('Error fetching sunset spots:', error);
    return {
      success: false,
      error: error.message,
      data: { all: [], viewpoints: [], parks: [], beaches: [] }
    };
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
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
  calculateDistance
};
