/**
 * Zustand store for sunset data - replaces SunsetDataContext
 * Provides fine-grained reactivity to avoid cascade re-renders
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  EnrichedSpot,
  QualityFactors,
  SunTimesData,
  WeatherData,
  LocationData,
} from '../services/types.js';
import { calculateSpotQuality } from '../utils/spotQuality.js';

interface SunsetState {
  // Raw data
  userLocation: LocationData | null;
  spots: EnrichedSpot[];
  sunData: SunTimesData | null;
  weather: WeatherData | null;
  sunsetQuality: QualityFactors | null;
  lastUpdated: Date | null;
  error: string | null;
  loading: boolean;

  // Actions
  setUserLocation: (location: LocationData | null) => void;
  setSpots: (spots: EnrichedSpot[]) => void;
  setSunData: (data: SunTimesData | null) => void;
  setWeather: (data: WeatherData | null) => void;
  setSunsetQuality: (quality: QualityFactors | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date | null) => void;

  // Computed (derived state)
  getFilteredSpots: (minScore?: number, maxScore?: number, maxDistance?: number) => EnrichedSpot[];
  getBestSpot: () => EnrichedSpot | null;
  getSpotQuality: (spot: EnrichedSpot) => number;
  getVisibilityDescription: () => string;
  formatTime: (isoString: string) => string;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  userLocation: null,
  spots: [],
  sunData: null,
  weather: null,
  sunsetQuality: null,
  lastUpdated: null,
  error: null,
  loading: false,
};

export const useSunsetStore = create<SunsetState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserLocation: (location) => set({ userLocation: location }),
      setSpots: (spots) => set({ spots }),
      setSunData: (data) => set({ sunData: data }),
      setWeather: (data) => set({ weather: data }),
      setSunsetQuality: (quality) => set({ sunsetQuality: quality }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setLastUpdated: (date) => set({ lastUpdated: date }),

      getFilteredSpots: (minScore = 0, maxScore = 10, maxDistance = 50) => {
        const { spots, sunsetQuality } = get();
        return spots.filter((spot) => {
          const score = calculateSpotQuality(spot, sunsetQuality);
          return score >= minScore && score <= maxScore && parseFloat(spot.distanceKm) <= maxDistance;
        });
      },

      getBestSpot: () => {
        const { spots, sunsetQuality } = get();
        if (spots.length === 0) return null;
        return [...spots].sort((a, b) =>
          calculateSpotQuality(b, sunsetQuality) - calculateSpotQuality(a, sunsetQuality)
        )[0];
      },

      getSpotQuality: (spot) => {
        const { sunsetQuality } = get();
        return calculateSpotQuality(spot, sunsetQuality);
      },

      getVisibilityDescription: () => {
        const { weather } = get();
        if (!weather?.visibility) return 'Unknown';

        const visibilityKm = weather.visibility / 1000;
        if (visibilityKm >= 10) return 'Excellent';
        if (visibilityKm >= 5) return 'Good';
        if (visibilityKm >= 3) return 'Fair';
        return 'Poor';
      },

      formatTime: (isoString) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'sunset-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        userLocation: state.userLocation,
        spots: state.spots,
        sunData: state.sunData,
      }),
    }
  )
);

// Selectors for fine-grained subscriptions
export const useUserLocation = () => useSunsetStore((state) => state.userLocation);
export const useSpots = () => useSunsetStore((state) => state.spots);
export const useSunData = () => useSunsetStore((state) => state.sunData);
export const useWeather = () => useSunsetStore((state) => state.weather);
export const useSunsetQuality = () => useSunsetStore((state) => state.sunsetQuality);
export const useLastUpdated = () => useSunsetStore((state) => state.lastUpdated);
export const useLoading = () => useSunsetStore((state) => state.loading);
export const useError = () => useSunsetStore((state) => state.error);
export const useSunsetActions = () =>
  useSunsetStore((state) => ({
    setUserLocation: state.setUserLocation,
    setSpots: state.setSpots,
    setSunData: state.setSunData,
    setWeather: state.setWeather,
    setSunsetQuality: state.setSunsetQuality,
    setLoading: state.setLoading,
    setError: state.setError,
    setLastUpdated: state.setLastUpdated,
    clearError: state.clearError,
    reset: state.reset,
  }));

export const useComputedSpots = () =>
  useSunsetStore((state) => ({
    getFilteredSpots: state.getFilteredSpots,
    getBestSpot: state.getBestSpot,
    getSpotQuality: state.getSpotQuality,
    getVisibilityDescription: state.getVisibilityDescription,
    formatTime: state.formatTime,
  }));