/**
 * React Query hooks for data fetching
 * Replaces manual useEffect + loading/error state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  findBestSunsetSpots,
  getSpotDetails,
  compareSpotsForTomorrow,
  getCurrentLocation,
} from '../services/index.js';
import type { EnrichedSpot } from '../services/types.js';
import { useSunsetStore } from '../stores/sunsetStore.js';

// Query keys
export const queryKeys = {
  location: ['location'] as const,
  sunsetSpots: (lat: number, lng: number, radius: number) =>
    ['sunsetSpots', lat, lng, radius] as const,
  spotDetails: (spotId: string | number) => ['spotDetails', spotId] as const,
  compareSpots: (spotIds: (string | number)[]) =>
    ['compareSpots', spotIds] as const,
};

/**
 * Hook to get current location
 */
export function useCurrentLocation() {
  return useQuery({
    queryKey: queryKeys.location,
    queryFn: () => getCurrentLocation(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch sunset spots for a location
 */
export function useSunsetSpots(lat: number | null, lng: number | null, radius = 10000) {
  return useQuery({
    queryKey: lat && lng ? queryKeys.sunsetSpots(lat, lng, radius) : ['sunsetSpots', 'disabled'],
    queryFn: () => findBestSunsetSpots(lat!, lng!, radius),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

/**
 * Hook to fetch spot details
 */
export function useSpotDetails(spot: EnrichedSpot | null) {
  return useQuery({
    queryKey: spot ? queryKeys.spotDetails(spot.id) : ['spotDetails', 'disabled'],
    queryFn: () => getSpotDetails(spot!),
    enabled: spot !== null,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to compare spots
 */
export function useCompareSpots(spots: EnrichedSpot[]) {
  const spotIds = spots.map((s) => s.id);
  return useQuery({
    queryKey: queryKeys.compareSpots(spotIds),
    queryFn: () => compareSpotsForTomorrow(spots),
    enabled: spots.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Mutation to refresh location and spots
 */
export function useRefreshSpots() {
  const queryClient = useQueryClient();
  const {
    setLoading,
    setError,
    setUserLocation,
    setSpots,
    setSunData,
    setWeather,
    setSunsetQuality,
    setLastUpdated,
  } = useSunsetStore();

  return useMutation({
    mutationFn: async () => {
      setLoading(true);
      setError(null);

      const locationResult = await getCurrentLocation();
      if (!locationResult.success) {
        throw new Error(locationResult.error || 'Unable to get location');
      }

      const { latitude, longitude } = locationResult.data!;
      setUserLocation({ latitude, longitude, accuracy: 0, timestamp: Date.now() });

      const spotsResult = await findBestSunsetSpots(latitude, longitude, 10000);
      if (!spotsResult.success) {
        throw new Error(spotsResult.error || 'Unable to fetch sunset spots');
      }

      const { spots, sunData, weather, sunsetQuality } = spotsResult.data!;
      setSpots(spots);
      setSunData(sunData);
      setWeather(weather);
      setSunsetQuality(sunsetQuality);
      setLastUpdated(new Date());

      return spotsResult.data;
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    },
    onSuccess: () => {
      setLoading(false);
      // Invalidate queries to trigger background refetch
      queryClient.invalidateQueries({ queryKey: ['sunsetSpots'] });
    },
  });
}

/**
 * Hook to prefetch spot details on hover
 */
export function usePrefetchSpotDetails() {
  const queryClient = useQueryClient();

  return (spot: EnrichedSpot) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.spotDetails(spot.id),
      queryFn: () => getSpotDetails(spot),
      staleTime: 10 * 60 * 1000,
    });
  };
}