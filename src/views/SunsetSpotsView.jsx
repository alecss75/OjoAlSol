import { Link } from 'react-router-dom'
import { getQualityColor } from '../constants/qualityConstants.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { useToast } from '../hooks/useToast.jsx'
import { useSunsetData } from '../hooks/useSunsetData.js'
import { SunStatusBanners } from '../components/SunStatusBanners.jsx'

/**
 * SunsetSpotsView - View for displaying nearby sunset spots
 * Shows a list of recommended locations with quality scores and details
 */
export function SunsetSpotsView() {
  const {
    userLocation,
    spots,
    loading,
    error,
    sunData,
    weather,
    sunsetQuality,
    lastUpdated,
    fetchLocationAndSpots,
    calculateSpotQuality,
    getVisibilityDescription,
    formatTime
  } = useSunsetData()
  
  const { toggleFavorite, isFavorite } = useFavorites('ojoalsol_spots_favorites')
  const { success } = useToast()






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
        
        {/* Sun status banners */}
        <SunStatusBanners sunData={sunData} />
        
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
                
                <div className="spot-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/map?spotId=${spot.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                    View Details
                  </Link>
                  {spot.latitude && spot.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      Google Maps
                    </a>
                  )}
                </div>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
