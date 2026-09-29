/**
 * Custom hook for managing visit history with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { EnrichedSpot } from '../services/types.js';

interface VisitRecord {
  spotId: string | number;
  spotName: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
}

interface UseVisitHistoryReturn {
  history: VisitRecord[];
  addVisit: (spot: EnrichedSpot) => void;
  getVisitsCount: (spotId: string | number) => number;
  getLastVisit: (spotId: string | number) => string | null;
  hasVisited: (spotId: string | number) => boolean;
  clearHistory: () => void;
  removeVisit: (spotId: string | number) => void;
  totalVisits: number;
  uniqueSpotsVisited: number;
}

/**
 * Custom hook for managing visit history with localStorage persistence
 * @param storageKey - Key for localStorage
 * @returns Visit history state and actions
 */
export function useVisitHistory(storageKey = 'ojoalsol_visit_history'): UseVisitHistoryReturn {
  // Initialize state from localStorage
  const [history, setHistory] = useState<VisitRecord[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading visit history from localStorage:', error);
      return [];
    }
  });

  // Persist to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving visit history to localStorage:', error);
    }
  }, [history, storageKey]);

  /**
   * Add a visit to a spot
   * @param spot - Spot object that was visited
   */
  const addVisit = useCallback((spot: EnrichedSpot) => {
    setHistory((prev) => {
      const now = new Date().toISOString();
      const existingVisitIndex = prev.findIndex((visit) => visit.spotId === spot.id);

      if (existingVisitIndex !== -1) {
        // Update existing visit with new timestamp and increment count
        const updated = [...prev];
        updated[existingVisitIndex] = {
          ...updated[existingVisitIndex],
          lastVisit: now,
          visitCount: (updated[existingVisitIndex].visitCount || 1) + 1,
          spotName: spot.name,
        };
        return updated;
      } else {
        // Add new visit
        return [
          ...prev,
          {
            spotId: spot.id,
            spotName: spot.name,
            firstVisit: now,
            lastVisit: now,
            visitCount: 1,
          },
        ];
      }
    });
  }, []);

  /**
   * Get the number of visits to a specific spot
   * @param spotId - Spot ID to check
   * @returns Number of visits
   */
  const getVisitsCount = useCallback(
    (spotId: string | number) => {
      const visit = history.find((h) => h.spotId === spotId);
      return visit ? visit.visitCount : 0;
    },
    [history]
  );

  /**
   * Get the last visit date for a specific spot
   * @param spotId - Spot ID to check
   * @returns ISO date string or null if never visited
   */
  const getLastVisit = useCallback(
    (spotId: string | number) => {
      const visit = history.find((h) => h.spotId === spotId);
      return visit ? visit.lastVisit : null;
    },
    [history]
  );

  /**
   * Check if a spot has been visited
   * @param spotId - Spot ID to check
   * @returns True if spot has been visited
   */
  const hasVisited = useCallback(
    (spotId: string | number) => {
      return history.some((h) => h.spotId === spotId);
    },
    [history]
  );

  /**
   * Clear all visit history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Remove a specific spot from history
   * @param spotId - Spot ID to remove
   */
  const removeVisit = useCallback((spotId: string | number) => {
    setHistory((prev) => prev.filter((h) => h.spotId !== spotId));
  }, []);

  return {
    history,
    addVisit,
    getVisitsCount,
    getLastVisit,
    hasVisited,
    clearHistory,
    removeVisit,
    totalVisits: history.reduce((sum, h) => sum + (h.visitCount || 1), 0),
    uniqueSpotsVisited: history.length,
  };
}

export default useVisitHistory;