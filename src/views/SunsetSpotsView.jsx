import { useState } from 'react'

/**
 * SunsetSpotsView - View for displaying nearby sunset spots
 * Shows a list of recommended locations with quality scores and details
 */
export function SunsetSpotsView() {
  const [spots] = useState([
    {
      id: 1,
      name: 'Mirador del Valle',
      distance: '2.3 km',
      qualityScore: 8.5,
      visibility: 'Excellent',
      bestTime: '19:45',
      description: 'Panoramic view of the valley with western horizon exposure',
    },
    {
      id: 2,
      name: 'Colina de las Flores',
      distance: '4.1 km',
      qualityScore: 7.8,
      visibility: 'Good',
      bestTime: '19:50',
      description: 'Elevated hilltop with minimal obstructions',
    },
    {
      id: 3,
      name: 'Playa Norte',
      distance: '6.5 km',
      qualityScore: 9.2,
      visibility: 'Perfect',
      bestTime: '19:40',
      description: 'Beachfront location with unobstructed ocean views',
    },
  ])

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Sunset Spots Near You</h1>
        <p className="hero-copy">
          Discover the best viewpoints around your location with quality scores and optimal viewing times.
        </p>
      </header>

      <section className="spots-grid" aria-label="Sunset spots list">
        {spots.map((spot) => (
          <article key={spot.id} className="spot-card">
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
            </div>
            <p className="spot-description">{spot.description}</p>
            <button className="btn-primary">View Details</button>
          </article>
        ))}
      </section>
    </main>
  )
}

function getQualityColor(score) {
  if (score >= 9) return 'high'
  if (score >= 7) return 'medium'
  return 'low'
}
