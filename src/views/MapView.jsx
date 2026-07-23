/**
 * MapView - View for displaying interactive map with sunset spots
 * Shows locations on a map with route guidance and orientation cues
 */
import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSunsetData } from '../hooks/useSunsetData.js'
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL, MARKER_COLORS } from '../constants/mapConstants'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Component for user location marker
function UserLocationMarker({ position }) {
  if (!position) return null

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>Your current location</Popup>
    </Marker>
  )
}

// Component for route polyline
function RouteLine({ start, end }) {
  if (!start || !end) return null

  const positions = [
    [start.lat, start.lng],
    [end.latitude, end.longitude],
  ]

  return (
    <Polyline
      positions={positions}
      color="#4c1d95"
      weight={4}
      opacity={0.8}
      dashArray="10, 10"
    />
  )
}

export function MapView() {
  const {
    spots,
    userLocation,
    loading,
    error,
    fetchLocationAndSpots,
    calculateSpotQuality,
    getVisibilityDescription
  } = useSunsetData()
  
  const [selectedSpot, setSelectedSpot] = useState(null)
  const mapRef = useRef(null)
  const [searchParams] = useSearchParams()
  const spotIdParam = searchParams.get('spotId')

  // Auto-select spot from URL
  useEffect(() => {
    if (spots.length > 0 && spotIdParam) {
      const targetSpot = spots.find(s => s.id.toString() === spotIdParam)
      if (targetSpot && selectedSpot?.id !== targetSpot.id) {
        handleNavigateToSpot(targetSpot)
      }
    }
  }, [spots, spotIdParam, userLocation])

  // Get custom marker icon based on quality score
  const getMarkerIcon = (score) => {
    let colorLevel = 'MEDIUM'
    if (score >= 8) colorLevel = 'HIGH'
    else if (score < 5) colorLevel = 'LOW'
    
    const color = MARKER_COLORS[colorLevel]
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 30px;
          height: 40px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    })
  }

  // Handle navigating to a spot
  const handleNavigateToSpot = (spot) => {
    setSelectedSpot(spot)
    if (mapRef.current && userLocation) {
      // Fit bounds to show both user location and spot
      const bounds = L.latLngBounds(
        [userLocation.lat, userLocation.lng],
        [spot.latitude, spot.longitude]
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    } else if (mapRef.current) {
      // Just center on the spot if no user location
      mapRef.current.setView([spot.latitude, spot.longitude], 14)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Map & Route Preview</h1>
        <p className="hero-copy">
          Interactive map with sunset spot locations, route guidance, and orientation cues.
        </p>
      </header>

      <section className="map-container" aria-label="Interactive map">
        <div className="map-wrapper" style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="spinner"></div>
              <p>Locating best spots...</p>
            </div>
          )}

          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
            zoom={DEFAULT_ZOOM_LEVEL}
            style={{ height: '500px', width: '100%', borderRadius: '0.85rem', zIndex: 1 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <UserLocationMarker position={userLocation} />
            
            {/* Spots markers */}
            {spots.map((spot) => {
              const score = calculateSpotQuality(spot)
              return (
                <Marker
                  key={spot.id}
                  position={[spot.latitude, spot.longitude]}
                  icon={getMarkerIcon(score)}
                  eventHandlers={{
                    click: () => setSelectedSpot(spot),
                  }}
                >
                  <Popup>
                    <strong>{spot.name}</strong><br />
                    Score: {score}/10
                  </Popup>
                </Marker>
              )
            })}
            
            {/* Route line if a spot is selected and user has location */}
            {selectedSpot && userLocation && (
              <RouteLine start={userLocation} end={selectedSpot} />
            )}
          </MapContainer>

          {/* Map controls overlay */}
          <div className="map-controls-overlay" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <button
              className="btn-secondary"
              onClick={fetchLocationAndSpots}
              disabled={loading}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {loading ? '🔍 Locating...' : '🧭 My Location'}
            </button>
            {selectedSpot && (
              <button
                className="btn-primary"
                onClick={() => handleNavigateToSpot(selectedSpot)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                🚀 Focus Route
              </button>
            )}
          </div>

          {error && (
            <div className="error-message" style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              zIndex: 1000,
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <aside className="map-sidebar">
          <h2>Nearby Spots</h2>
          <ul className="spots-list">
            {spots.map((spot) => {
              const score = calculateSpotQuality(spot)
              let colorLevel = 'medium'
              if (score >= 8) colorLevel = 'high'
              else if (score < 5) colorLevel = 'low'
              
              return (
                <li key={spot.id} className={`spot-item ${selectedSpot?.id === spot.id ? 'active' : ''}`} style={selectedSpot?.id === spot.id ? { borderLeft: '4px solid var(--color-primary, #ff7b54)', backgroundColor: '#fff7ed' } : {}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{spot.name}</strong>
                    <span
                      className={`badge badge-${colorLevel}`}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    >
                      {score}/10
                    </span>
                  </div>
                  <span className="spot-coords">
                    {spot.distanceKm} km away
                  </span>
                  <button
                    className="btn-outline"
                    onClick={() => handleNavigateToSpot(spot)}
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    🗺️ View on Map
                  </button>
                </li>
              )
            })}
          </ul>
          
          {selectedSpot && userLocation && (
            <div className="route-info" style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#0369a1' }}>
                Route to {selectedSpot.name}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#0c4a6e' }}>
                Follow the dashed line on the map for directions from your location.
                Distance: {selectedSpot.distanceKm} km.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.latitude},${selectedSpot.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.5rem', fontSize: '0.9rem' }}
              >
                Open in Google Maps
              </a>
            </div>
          )}
          
          <div className="map-legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <span className="legend-color high"></span>
              <span>Excellent spot (8-10)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span>
              <span>Good spot (5-8)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color low"></span>
              <span>Fair spot (&lt;5)</span>
            </div>
            <div className="legend-item">
              <div style={{
                width: '16px',
                height: '16px',
                background: '#3b82f6',
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}></div>
              <span>Your location</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
