/**
 * Shared types for all services
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number; // meters
  cloudCoverage: number; // percentage
  weatherCondition: string;
  weatherDescription: string;
  windSpeed: number;
  windDirection: number;
  sunrise: string; // ISO string
  sunset: string; // ISO string
  pop?: number; // probability of precipitation
}

export interface ForecastItem {
  datetime: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  cloudCoverage: number;
  weatherCondition: string;
  weatherDescription: string;
  windSpeed: number;
  pop: number;
}

export interface ForecastData {
  city: string;
  country: string;
  timezone: number;
  forecast: ForecastItem[];
}

export interface SunTimesData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: number;
  civilTwilightBegin: string;
  civilTwilightEnd: string;
  nauticalTwilightBegin: string;
  nauticalTwilightEnd: string;
  astronomicalTwilightBegin: string;
  astronomicalTwilightEnd: string;
  sunsetAzimuth?: number;
  sunriseAzimuth?: number;
}

export interface SolarPositionData {
  sunsetAzimuth: number;
  sunriseAzimuth: number;
  solarNoon: string;
  dayLength: number;
  civilTwilightBegin: string;
  civilTwilightEnd: string;
  nauticalTwilightBegin: string;
  nauticalTwilightEnd: string;
  astronomicalTwilightBegin: string;
  astronomicalTwilightEnd: string;
}

export interface GoldenHourData {
  start: string;
  end: string;
  duration: number; // minutes
}

export interface QualityFactors {
  score: number; // 0-10
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
  factors: string[];
}

export interface SpotTags {
  name?: string;
  description?: string;
  website?: string;
  image?: string;
  openingHours?: string;
  surface?: string;
  [key: string]: unknown;
}

export interface BaseSpot {
  id: string | number;
  type: 'node' | 'way' | 'relation';
  category: 'viewpoint' | 'park' | 'beach' | 'other';
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  tags: SpotTags;
}

export interface EnrichedSpot extends BaseSpot {
  distanceKm: string;
  distanceMeters: number;
  sunData?: SunTimesData | null;
  goldenHour?: GoldenHourData | null;
  weather?: WeatherData | null;
  sunsetQuality?: QualityFactors | null;
}

export interface SpotsGrouped {
  viewpoints: BaseSpot[];
  parks: BaseSpot[];
  beaches: BaseSpot[];
  all: BaseSpot[];
}

export interface FindSpotsResult {
  success: boolean;
  data?: SpotsGrouped;
  count: number;
  summary?: {
    viewpoints: number;
    parks: number;
    beaches: number;
  };
  error?: string;
}

export interface SpotsResponse {
  success: boolean;
  data?: {
    spots: EnrichedSpot[];
    count: number;
    summary?: {
      viewpoints: number;
      parks: number;
      beaches: number;
    };
    sunData?: SunTimesData | null;
    weather?: WeatherData | null;
    sunsetQuality?: QualityFactors | null;
  };
  error?: string;
}

export interface SpotDetailsResponse {
  success: boolean;
  data?: EnrichedSpot;
  error?: string;
}

export interface CompareSpotsResponse {
  success: boolean;
  data?: EnrichedSpot[];
  error?: string;
}

export interface LocationResponse {
  success: boolean;
  data?: LocationData;
  error?: string;
}

export interface WeatherResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

export interface ForecastResponse {
  success: boolean;
  data?: ForecastData;
  error?: string;
}

export interface SunTimesResponse {
  success: boolean;
  data?: SunTimesData;
  timezone?: string;
  error?: string;
}

export interface SolarPositionResponse {
  success: boolean;
  data?: SolarPositionData;
  error?: string;
}

export interface QualityResponse {
  success: boolean;
  data?: QualityFactors;
  error?: string;
}