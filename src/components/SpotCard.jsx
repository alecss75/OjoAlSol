import { Link } from 'react-router-dom'
import { getQualityColor } from '../constants/qualityConstants.js'

/**
 * SpotCard - Card component for displaying sunset spot summary
 * Used in HomeView to show nearby recommendations
 */
export function SpotCard({ spot }) {
  return (
    <article className="spot-card home-spot-card">
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
      <div className="spot-footer" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
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
}

/**
 * QuickAccessCard - Card component for quick navigation to other views
 */
export function QuickAccessCard({ title, description, icon, linkTo, linkLabel }) {
  return (
    <article className="quick-access-card">
      <div className="quick-access-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={linkTo} className="btn-outline">
        {linkLabel}
      </Link>
    </article>
  )
}
