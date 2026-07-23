import { useState, useMemo } from 'react'
import { getQualityColor } from '../constants/qualityConstants.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { useVisitHistory } from '../hooks/useVisitHistory.js'
import { useToast } from '../hooks/useToast.jsx'

/**
 * FavoritesView - View for managing saved favorite sunset spots
 * Allows users to compare and manage their preferred locations
 */
export function FavoritesView() {
  const { favorites, removeFavorite, isFavorite, toggleFavorite } = useFavorites('ojoalsol_spots_favorites')
  const { addVisit, hasVisited, getLastVisit, getVisitsCount } = useVisitHistory('ojoalsol_visit_history')
  const { success, warning } = useToast()
  const [selectedForCompare, setSelectedForCompare] = useState([])

  /**
   * Handle removing a favorite
   */
  const handleRemoveFavorite = (spot) => {
    removeFavorite(spot.id)
    // Also remove from comparison if selected
    setSelectedForCompare((prev) => prev.filter((id) => id !== spot.id))
    success(`${spot.name} removed from favorites`)
  }

  /**
   * Handle toggling selection for comparison
   */
  const handleToggleCompare = (spotId) => {
    const spot = favorites.find((s) => s.id === spotId)
    setSelectedForCompare((prev) => {
      if (prev.includes(spotId)) {
        return prev.filter((id) => id !== spotId)
      } else {
        if (prev.length >= 3) {
          warning('You can only compare up to 3 spots at a time')
          return prev
        }
        success(`${spot?.name} added to comparison`)
        return [...prev, spotId]
      }
    })
  }

  /**
   * Handle viewing spot details (marks as visited)
   */
  const handleViewDetails = (spot) => {
    addVisit(spot)
    success(`Marked ${spot.name} as visited!`)
    console.log('Viewing details for:', spot.name)
  }

  /**
   * Get spots selected for comparison
   */
  const spotsToCompare = useMemo(() => {
    return favorites.filter((spot) => selectedForCompare.includes(spot.id))
  }, [favorites, selectedForCompare])

  /**
   * Format date for display
   */
  const formatDate = (isoString) => {
    if (!isoString) return '--/--/----'
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Your Favorite Spots</h1>
        <p className="hero-copy">
          Save and compare your preferred sunset locations for tomorrow's viewing options.
        </p>
        {favorites.length > 0 && (
          <div className="favorites-summary" style={{ marginTop: '1rem' }}>
            <span className="badge badge-primary">{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
            {selectedForCompare.length > 0 && (
              <span className="badge badge-secondary" style={{ marginLeft: '0.5rem' }}>
                {selectedForCompare.length}/3 selected for comparison
              </span>
            )}
          </div>
        )}
      </header>

      {favorites.length === 0 ? (
        <section className="empty-state">
          <p>No favorites yet. Start exploring and save your first spot!</p>
        </section>
      ) : (
        <>
          <section className="favorites-grid" aria-label="Favorite spots list">
            {favorites.map((spot) => {
              const isSelected = selectedForCompare.includes(spot.id)
              const visited = hasVisited(spot.id)
              const lastVisitDate = getLastVisit(spot.id)
              const visitCount = getVisitsCount(spot.id)
              
              return (
                <article key={spot.id} className={`favorite-card ${isSelected ? 'selected-for-compare' : ''}`}>
                  <div className="spot-header">
                    <h2>{spot.name}</h2>
                    <div className="spot-actions">
                      <span className={`badge badge-${getQualityColor(spot.qualityScore)}`}>
                        {spot.qualityScore}/10
                      </span>
                      <button 
                        className={`favorite-btn ${isFavorite(spot.id) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(spot)}
                        aria-label={isFavorite(spot.id) ? 'Remove from favorites' : 'Add to favorites'}
                        title="Remove from favorites"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                  <div className="spot-details">
                    <p className="spot-distance">📍 {spot.distance} away</p>
                    <p className="spot-visibility">👁️ Visibility: {spot.visibility}</p>
                    <p className="spot-time">⏰ Best time: {spot.bestTime}</p>
                    {visited && (
                      <p className="spot-visited">
                        ✅ Visited {visitCount} time{visitCount !== 1 ? 's' : ''}
                        {lastVisitDate && ` • Last: ${formatDate(lastVisitDate)}`}
                      </p>
                    )}
                  </div>
                  <p className="spot-description">{spot.description}</p>
                  <div className="favorite-actions">
                    <button 
                      className={`btn-secondary ${isSelected ? 'active' : ''}`}
                      onClick={() => handleToggleCompare(spot.id)}
                    >
                      {isSelected ? '✓ Selected' : 'Compare'}
                    </button>
                    <button 
                      className="btn-outline" 
                      onClick={() => handleViewDetails(spot)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn-outline" 
                      onClick={() => handleRemoveFavorite(spot)}
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              )
            })}
          </section>

          {/* Comparison Panel */}
          {spotsToCompare.length > 0 && (
            <section className="compare-section" aria-label="Comparison panel">
              <div className="compare-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Compare Spots ({spotsToCompare.length}/3)</h2>
                <button 
                  className="btn-outline" 
                  onClick={() => setSelectedForCompare([])}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Clear Selection
                </button>
              </div>
              <div className="compare-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${spotsToCompare.length}, 1fr)`,
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {spotsToCompare.map((spot) => (
                  <div key={spot.id} className="compare-card" style={{
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#1e293b' }}>{spot.name}</h3>
                    <div className="compare-metric" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quality Score</span>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{spot.qualityScore}/10</p>
                    </div>
                    <div className="compare-metric" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Distance</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>{spot.distance}</p>
                    </div>
                    <div className="compare-metric" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Visibility</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>{spot.visibility}</p>
                    </div>
                    <div className="compare-metric" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Best Time</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>{spot.bestTime}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="btn-primary" 
                disabled={spotsToCompare.length < 2}
                style={{ opacity: spotsToCompare.length >= 2 ? 1 : 0.6 }}
              >
                📊 View Detailed Comparison
              </button>
            </section>
          )}

          {/* Visit History Summary */}
          <section className="history-section" style={{ marginTop: '2rem' }}>
            <h2>Visit History</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Track your visits to favorite spots
            </p>
            {favorites.filter((spot) => hasVisited(spot.id)).length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>No visits recorded yet. Click "View Details" to mark a spot as visited.</p>
            ) : (
              <div className="history-list" style={{ display: 'grid', gap: '0.5rem' }}>
                {favorites.filter((spot) => hasVisited(spot.id)).map((spot) => (
                  <div key={spot.id} className="history-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0',
                  }}>
                    <div>
                      <strong style={{ color: '#166534' }}>{spot.name}</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                        Visited {getVisitsCount(spot.id)} time{getVisitsCount(spot.id) !== 1 ? 's' : ''}
                        {getLastVisit(spot.id) && ` • Last: ${formatDate(getLastVisit(spot.id))}`}
                      </p>
                    </div>
                    <span className="badge badge-success">✅</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
