import React, { createContext, useState, useEffect, useCallback } from 'react'
import { getCurrentLocation } from '../services/locationService.js'
import { findBestSunsetSpots } from '../services/sunsetSpotsService.js'
import { getCurrentWeather, calculateSunsetQuality } from '../services/openWeatherService.js'

// 1. Create the Context
export const SunsetDataContext = createContext(null)

// 2. Create the Provider Component
export function SunsetDataProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null)
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sunData, setSunData] = useState(null)
  const [weather, setWeather] = useState(null)
  const [sunsetQuality, setSunsetQuality] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchWeatherData = useCallback(async (lat, lng) => {
    try {
      const weatherResult = await getCurrentWeather(lat, lng)
      
      if (weatherResult.success && weatherResult.data) {
        setWeather(weatherResult.data)
        const quality = calculateSunsetQuality(weatherResult.data)
        setSunsetQuality(quality)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Error fetching weather data:', err)
    }
  }, [])

  const fetchLocationAndSpots = useCallback(async (force = false) => {
    // If we already have data and we're not forcing a refresh, skip fetching
    if (!force && spots.length > 0 && userLocation) {
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const locationResult = await getCurrentLocation()
      
      if (!locationResult.success) {
        throw new Error(locationResult.error || 'Unable to get your location')
      }
      
      const { latitude, longitude } = locationResult.data
      console.log(`[Location] lat: ${latitude}, lng: ${longitude}`)
      setUserLocation({ lat: latitude, lng: longitude })
      
      const spotsResult = await findBestSunsetSpots(latitude, longitude, 10000)
      
      if (!spotsResult.success) {
        throw new Error(spotsResult.error || 'Unable to fetch sunset spots')
      }
      
      const { spots: foundSpots, sunData: sunTimes, weather: weatherData, sunsetQuality: quality } = spotsResult.data
      
      if (sunTimes) {
        console.log(`[SunTimes Data] sunrise: ${sunTimes.sunrise}, sunset: ${sunTimes.sunset}`)
      }
      
      setSpots(foundSpots)
      setSunData(sunTimes)
      setWeather(weatherData)
      setSunsetQuality(quality)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching location or spots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [spots.length, userLocation])

  // Initial fetch on mount
  useEffect(() => {
    fetchLocationAndSpots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-refresh weather data every 5 minutes if we have location
  useEffect(() => {
    if (!userLocation) return
    
    // fetchWeatherData(userLocation.lat, userLocation.lng) // Already fetched initially
    
    const refreshInterval = setInterval(() => {
      fetchWeatherData(userLocation.lat, userLocation.lng)
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(refreshInterval)
  }, [userLocation, fetchWeatherData])

  const calculateSpotQuality = useCallback((spot) => {
    let score = 50 // Base score
    
    if (spot.category === 'beach') score += 20
    if (spot.category === 'viewpoint') score += 15
    if (spot.category === 'park') score += 10
    
    const distanceKm = parseFloat(spot.distanceKm) || 999
    if (distanceKm < 2) score += 20
    else if (distanceKm < 5) score += 15
    else if (distanceKm < 10) score += 10
    
    if (sunsetQuality && sunsetQuality.score) {
      score += (sunsetQuality.score / 10)
    }
    
    return Math.min(10, Math.max(0, score / 10)).toFixed(1)
  }, [sunsetQuality])

  const getVisibilityDescription = useCallback(() => {
    if (!weather?.visibility) return 'Unknown'
    
    const visibilityKm = weather.visibility / 1000
    if (visibilityKm >= 10) return 'Excellent'
    if (visibilityKm >= 5) return 'Good'
    if (visibilityKm >= 3) return 'Fair'
    return 'Poor'
  }, [weather])

  const formatTime = useCallback((isoString) => {
    if (!isoString) return '--:--'
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }, [])

  const contextValue = {
    userLocation,
    spots,
    loading,
    error,
    sunData,
    weather,
    sunsetQuality,
    lastUpdated,
    fetchLocationAndSpots: () => fetchLocationAndSpots(true), // Expose force refresh
    calculateSpotQuality,
    getVisibilityDescription,
    formatTime
  }

  return (
    <SunsetDataContext.Provider value={contextValue}>
      {children}
    </SunsetDataContext.Provider>
  )
}
