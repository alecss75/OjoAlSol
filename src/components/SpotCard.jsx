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
      <Link to="/spots" className="btn-primary">
        View Details
      </Link>
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
