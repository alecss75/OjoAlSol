import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing favorites with localStorage persistence
 * @param {string} storageKey - Key for localStorage
 * @returns {{favorites: Array, addFavorite: Function, removeFavorite: Function, isFavorite: Function, clearFavorites: Function}}
 */
export function useFavorites(storageKey = 'ojoalsol_favorites') {
  // Initialize state from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error)
      return []
    }
  })

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [favorites, storageKey])

  /**
   * Add a favorite spot
   * @param {Object} spot - Spot object to add
   */
  const addFavorite = useCallback((spot) => {
    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((fav) => fav.id === spot.id)) {
        console.warn('Spot already in favorites')
        return prev
      }
      return [...prev, { ...spot, addedAt: new Date().toISOString() }]
    })
  }, [])

  /**
   * Remove a favorite spot
   * @param {string|number} id - Spot ID to remove
   */
  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }, [])

  /**
   * Check if a spot is in favorites
   * @param {string|number} id - Spot ID to check
   * @returns {boolean} True if spot is in favorites
   */
  const isFavorite = useCallback(
    (id) => {
      return favorites.some((fav) => fav.id === id)
    },
    [favorites]
  )

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  /**
   * Toggle favorite status
   * @param {Object} spot - Spot object to toggle
   */
  const toggleFavorite = useCallback(
    (spot) => {
      if (isFavorite(spot.id)) {
        removeFavorite(spot.id)
      } else {
        addFavorite(spot)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    toggleFavorite,
    count: favorites.length,
  }
}

export default useFavorites
