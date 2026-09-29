/**
 * Custom hook for managing favorites with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { EnrichedSpot } from '../services/types.js';

interface FavoriteSpot extends EnrichedSpot {
  addedAt: string;
}

interface UseFavoritesReturn {
  favorites: FavoriteSpot[];
  addFavorite: (spot: EnrichedSpot) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
  clearFavorites: () => void;
  toggleFavorite: (spot: EnrichedSpot) => void;
  count: number;
}

/**
 * Custom hook for managing favorites with localStorage persistence
 * @param storageKey - Key for localStorage
 * @returns Favorites state and actions
 */
export function useFavorites(storageKey = 'ojoalsol_spots_favorites'): UseFavoritesReturn {
  // Initialize state from localStorage
  const [favorites, setFavorites] = useState<FavoriteSpot[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  });

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites, storageKey]);

  /**
   * Add a favorite spot
   * @param spot - Spot object to add
   */
  const addFavorite = useCallback((spot: EnrichedSpot) => {
    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((fav) => fav.id === spot.id)) {
        console.warn('Spot already in favorites');
        return prev;
      }
      return [...prev, { ...spot, addedAt: new Date().toISOString() }];
    });
  }, []);

  /**
   * Remove a favorite spot
   * @param id - Spot ID to remove
   */
  const removeFavorite = useCallback((id: string | number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }, []);

  /**
   * Check if a spot is in favorites
   * @param id - Spot ID to check
   * @returns True if spot is in favorites
   */
  const isFavorite = useCallback(
    (id: string | number) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites]
  );

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  /**
   * Toggle favorite status
   * @param spot - Spot object to toggle
   */
  const toggleFavorite = useCallback(
    (spot: EnrichedSpot) => {
      if (isFavorite(spot.id)) {
        removeFavorite(spot.id);
      } else {
        addFavorite(spot);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    toggleFavorite,
    count: favorites.length,
  };
}

export default useFavorites;