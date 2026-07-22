import { useState } from 'react'

/**
 * FavoritesView - View for managing saved favorite sunset spots
 * Allows users to compare and manage their preferred locations
 */
export function FavoritesView() {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: 'Playa Norte',
      distance: '6.5 km',
      qualityScore: 9.2,
      visibility: 'Perfect',
      bestTime: '19:40',
      description: 'Beachfront location with unobstructed ocean views',
      visited: true,
      lastVisit: '2025-07-15',
    },
    {
      id: 2,
      name: 'Mirador del Valle',
      distance: '2.3 km',
      qualityScore: 8.5,
      visibility: 'Excellent',
      bestTime: '19:45',
      description: 'Panoramic view of the valley with western horizon exposure',
      visited: false,
      lastVisit: null,
    },
  ])

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Your Favorite Spots</h1>
        <p className="hero-copy">
          Save and compare your preferred sunset locations for tomorrow's viewing options.
        </p>
      </header>

      {favorites.length === 0 ? (
        <section className="empty-state">
          <p>No favorites yet. Start exploring and save your first spot!</p>
        </section>
      ) : (
        <section className="favorites-grid" aria-label="Favorite spots list">
          {favorites.map((spot) => (
            <article key={spot.id} className="favorite-card">
              <div className="spot-header">
                <h2>{spot.name}</h2>
                <span className={`badge badge-${getQualityColor(spot.qualityScore)}`}>
                  {spot.qualityScore}/10
                </span>
              </div>
              <div className="spot-details">
                <p className="spot-distance">📍 {spot.distance} away</p>
                <p className="spot-visibility">👁️ Visibility: {spot.visibility}</p>
                <p className="spot-time">⏰ Best time: {spot.bestTime}</p>
                {spot.visited && (
                  <p className="spot-visited">✅ Visited on {spot.lastVisit}</p>
                )}
              </div>
              <p className="spot-description">{spot.description}</p>
              <div className="favorite-actions">
                <button className="btn-secondary">Compare</button>
                <button className="btn-outline" onClick={() => removeFavorite(spot.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="compare-section">
        <h2>Compare Tomorrow's Options</h2>
        <p>Select up to 3 spots to compare sunset times, visibility, and conditions.</p>
        <button className="btn-primary" disabled={favorites.length < 2}>
          Start Comparison
        </button>
      </section>
    </main>
  )
}

function getQualityColor(score) {
  if (score >= 9) return 'high'
  if (score >= 7) return 'medium'
  return 'low'
}
