import { useState, useEffect, useCallback } from 'react'
import { getQualityColor } from '../constants/qualityConstants.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { useToast } from '../hooks/useToast.jsx'
import { getCurrentLocation } from '../services/locationService.js'
import { findBestSunsetSpots } from '../services/sunsetSpotsService.js'
import { getCurrentWeather } from '../services/openWeatherService.js'
import { calculateSunsetQuality } from '../services/openWeatherService.js'

/**
 * SunsetSpotsView - View for displaying nearby sunset spots
 * Shows a list of recommended locations with quality scores and details
 */
export function SunsetSpotsView() {
  const [userLocation, setUserLocation] = useState(null)
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sunData, setSunData] = useState(null)
  const [weather, setWeather] = useState(null)
  const [sunsetQuality, setSunsetQuality] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const { toggleFavorite, isFavorite } = useFavorites('ojoalsol_spots_favorites')
  const { success, error: showError } = useToast()

  /**
   * Fetch weather and update sunset quality dynamically
   */
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

  /**
   * Fetch user location and sunset spots
   */
  const fetchLocationAndSpots = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get user's current location
      const locationResult = await getCurrentLocation()
      
      if (!locationResult.success) {
        throw new Error(locationResult.error || 'Unable to get your location')
      }
      
      const { latitude, longitude } = locationResult.data
      setUserLocation({ lat: latitude, lng: longitude })
      
      // Find best sunset spots near user location
      const spotsResult = await findBestSunsetSpots(latitude, longitude, 10000)
      
      if (!spotsResult.success) {
        throw new Error(spotsResult.error || 'Unable to fetch sunset spots')
      }
      
      const { spots: foundSpots, sunData: sunTimes, weather: weatherData, sunsetQuality: quality } = spotsResult.data
      
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
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchLocationAndSpots()
  }, [fetchLocationAndSpots])

  // Set up auto-refresh for weather data every 5 minutes
  useEffect(() => {
    if (!userLocation) return
    
    // Initial weather fetch after location is loaded
    fetchWeatherData(userLocation.lat, userLocation.lng)
    
    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchWeatherData(userLocation.lat, userLocation.lng)
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(refreshInterval)
  }, [userLocation, fetchWeatherData])

  /**
   * Format time from ISO string to HH:mm
   */
  const formatTime = (isoString) => {
    if (!isoString) return '--:--'
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  /**
   * Calculate quality score for a spot based on various factors
   */
  const calculateSpotQuality = (spot) => {
    let score = 50 // Base score
    
    // Add points based on category
    if (spot.category === 'beach') score += 20
    if (spot.category === 'viewpoint') score += 15
    if (spot.category === 'park') score += 10
    
    // Add points based on distance (closer is better)
    const distanceKm = parseFloat(spot.distanceKm) || 999
    if (distanceKm < 2) score += 20
    else if (distanceKm < 5) score += 15
    else if (distanceKm < 10) score += 10
    
    // Add weather-based quality if available
    if (sunsetQuality && sunsetQuality.score) {
      score += (sunsetQuality.score / 10)
    }
    
    // Normalize to 0-10 scale
    return Math.min(10, Math.max(0, score / 10)).toFixed(1)
  }

  /**
   * Get visibility description based on weather data
   */
  const getVisibilityDescription = () => {
    if (!weather?.visibility) return 'Unknown'
    
    const visibilityKm = weather.visibility / 1000
    if (visibilityKm >= 10) return 'Excellent'
    if (visibilityKm >= 5) return 'Good'
    if (visibilityKm >= 3) return 'Fair'
    return 'Poor'
  }

  /**
   * Get real-time visibility conditions with details
   */
  const getVisibilityConditions = () => {
    if (!weather?.visibility) {
      return {
        description: 'Unknown',
        distance: null,
        status: 'unknown'
      }
    }
    
    const visibilityMeters = weather.visibility
    const visibilityKm = visibilityMeters / 1000
    
    let status, description
    if (visibilityKm >= 10) {
      status = 'excellent'
      description = 'Excellent visibility - clear views for miles'
    } else if (visibilityKm >= 5) {
      status = 'good'
      description = 'Good visibility - clear horizon views'
    } else if (visibilityKm >= 3) {
      status = 'fair'
      description = 'Fair visibility - some atmospheric haze'
    } else {
      status = 'poor'
      description = 'Poor visibility - fog or heavy haze'
    }
    
    return {
      description,
      distance: visibilityKm.toFixed(1),
      status,
      meters: visibilityMeters
    }
  }

  /**
   * Handle retry button click
   */
  const handleRetry = () => {
    fetchLocationAndSpots()
  }

  /**
   * Handle toggle favorite with toast notification
   */
  const handleToggleFavorite = (spot) => {
    const wasFavorite = isFavorite(spot.id)
    toggleFavorite(spot)
    
    if (wasFavorite) {
      success(`${spot.name} removed from favorites`)
    } else {
      success(`${spot.name} added to favorites! ❤️`)
    }
  }

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <main className="app-shell">
        <header className="hero">
          <p className="eyebrow">OjoAlSol</p>
          <h1>Sunset Spots Near You</h1>
          <p className="hero-copy">
            Finding the best viewpoints around your location...
          </p>
        </header>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading spots...</p>
        </div>
      </main>
    )
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <main className="app-shell">
        <header className="hero">
          <p className="eyebrow">OjoAlSol</p>
          <h1>Sunset Spots Near You</h1>
          <p className="hero-copy">
            Discover the best viewpoints around your location with quality scores and optimal viewing times.
          </p>
        </header>
        <div className="error-state">
          <p className="error-message">⚠️ {error}</p>
          <button className="btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Sunset Spots Near You</h1>
        <p className="hero-copy">
          Discover the best viewpoints around your location with quality scores and optimal viewing times.
        </p>
        
        {/* User location info */}
        {userLocation && (
          <div className="location-info">
            <span className="location-badge">
              📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          </div>
        )}
        
        {/* Current sunset quality summary */}
        {sunsetQuality && (
          <div className="sunset-summary">
            <span className={`quality-badge quality-${sunsetQuality.quality.toLowerCase()}`}>
              Today's Sunset Quality: {sunsetQuality.quality} ({sunsetQuality.score}/100)
            </span>
          </div>
        )}
        
        {/* Real-time visibility conditions */}
        {weather && (
          <div className="visibility-conditions">
            <div className="condition-card">
              <h3>👁️ Current Visibility Conditions</h3>
              <div className="condition-details">
                <p className="condition-value">{getVisibilityConditions().description}</p>
                {getVisibilityConditions().distance && (
                  <p className="condition-metric">Distance: {getVisibilityConditions().distance} km</p>
                )}
                <p className="condition-extra">☁️ Cloud Coverage: {weather.cloudCoverage}%</p>
                <p className="condition-extra">💧 Humidity: {weather.humidity}%</p>
                <p className="condition-extra">🌡️ Temperature: {Math.round(weather.temperature)}°C</p>
                {lastUpdated && (
                  <p className="condition-timestamp">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spots count */}
      <div className="spots-count">
        <p>Found {spots.length} sunset spot{spots.length !== 1 ? 's' : ''} within 10km</p>
      </div>

      <section className="spots-grid" aria-label="Sunset spots list">
        {spots.length === 0 ? (
          <div className="no-spots">
            <p>No sunset spots found nearby. Try expanding your search radius.</p>
          </div>
        ) : (
          spots.map((spot) => {
            const qualityScore = calculateSpotQuality(spot)
            const favorite = isFavorite(spot.id)
            
            return (
              <article key={spot.id} className="spot-card">
                <div className="spot-header">
                  <h2>{spot.name}</h2>
                  <div className="spot-actions">
                    <span className={`badge badge-${getQualityColor(qualityScore)}`}>
                      {qualityScore}/10
                    </span>
                    <button 
                      className={`favorite-btn ${favorite ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(spot)}
                      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
                
                <div className="spot-category">
                  <span className="category-tag">{spot.category}</span>
                </div>
                
                <div className="spot-details">
                  <p className="spot-distance">📍 {spot.distanceKm} km away</p>
                  <p className="spot-visibility">👁️ Visibility: {getVisibilityDescription()}</p>
                  {sunData?.sunset && (
                    <p className="spot-time">⏰ Sunset: {formatTime(sunData.sunset)}</p>
                  )}
                  {sunData && sunData.sunset && (
                    <p className="spot-golden-hour">
                      🌅 Golden Hour starts: {formatTime(new Date(new Date(sunData.sunset).getTime() - 60 * 60 * 1000).toISOString())}
                    </p>
                  )}
                </div>
                
                {spot.description && (
                  <p className="spot-description">{spot.description}</p>
                )}
                
                {spot.openingHours && (
                  <p className="spot-hours">🕐 Hours: {spot.openingHours}</p>
                )}
                
                <div className="spot-footer">
                  <button className="btn-primary">View Details</button>
                </div>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
