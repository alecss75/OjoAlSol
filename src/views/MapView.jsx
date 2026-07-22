/**
 * MapView - View for displaying interactive map with sunset spots
 * Shows locations on a map with route guidance and orientation cues
 */
import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { getCurrentLocation } from '../services/locationService'
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
    <Marker position={[position.latitude, position.longitude]} icon={userIcon}>
      <Popup>Your current location</Popup>
    </Marker>
  )
}

// Component for route polyline
function RouteLine({ start, end }) {
  if (!start || !end) return null

  const positions = [
    [start.latitude, start.longitude],
    [end.lat, end.lng],
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
  const [spots] = useState([
    { id: 1, name: 'Mirador del Valle', lat: 40.4168, lng: -3.7038, visibility: 'high' },
    { id: 2, name: 'Colina de las Flores', lat: 40.42, lng: -3.695, visibility: 'medium' },
    { id: 3, name: 'Playa Norte', lat: 40.435, lng: -3.71, visibility: 'low' },
  ])

  const [userPosition, setUserPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const mapRef = useRef(null)

  // Get custom marker icon based on visibility
  const getMarkerIcon = (visibility) => {
    const color = MARKER_COLORS[visibility.toUpperCase()] || MARKER_COLORS.MEDIUM
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

  // Handle getting user location
  const handleGetUserLocation = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getCurrentLocation()
      setUserPosition(result.data)
      // Center map on user location
      if (mapRef.current) {
        mapRef.current.setView([result.data.latitude, result.data.longitude], 14)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle navigating to a spot
  const handleNavigateToSpot = (spot) => {
    setSelectedSpot(spot)
    if (mapRef.current && userPosition) {
      // Fit bounds to show both user location and spot
      const bounds = L.latLngBounds(
        [userPosition.latitude, userPosition.longitude],
        [spot.lat, spot.lng]
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    } else if (mapRef.current) {
      // Just center on the spot if no user location
      mapRef.current.setView([spot.lat, spot.lng], 14)
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
          <MapContainer
            center={[DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
            zoom={DEFAULT_ZOOM_LEVEL}
            style={{ height: '500px', width: '100%', borderRadius: '0.85rem', zIndex: 1 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <UserLocationMarker position={userPosition} />
            
            {/* Spots markers */}
            {spots.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={getMarkerIcon(spot.visibility)}
                eventHandlers={{
                  click: () => setSelectedSpot(spot),
                }}
              >
                <Popup>
                  <strong>{spot.name}</strong><br />
                  Visibility: {spot.visibility}
                </Popup>
              </Marker>
            ))}
            
            {/* Route line if a spot is selected and user has location */}
            {selectedSpot && userPosition && (
              <RouteLine start={userPosition} end={selectedSpot} />
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
              onClick={handleGetUserLocation}
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
                🚀 Navigate
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
            {spots.map((spot) => (
              <li key={spot.id} className="spot-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{spot.name}</strong>
                  <span
                    className={`badge badge-${spot.visibility}`}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    {spot.visibility}
                  </span>
                </div>
                <span className="spot-coords">
                  {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                </span>
                <button
                  className="btn-outline"
                  onClick={() => handleNavigateToSpot(spot)}
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  🗺️ View on Map
                </button>
              </li>
            ))}
          </ul>
          
          {selectedSpot && userPosition && (
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
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#0c4a6e' }}>
                Follow the dashed line on the map for directions from your location.
              </p>
            </div>
          )}
          
          <div className="map-legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <span className="legend-color high"></span>
              <span>Excellent visibility</span>
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span>
              <span>Good visibility</span>
            </div>
            <div className="legend-item">
              <span className="legend-color low"></span>
              <span>Fair visibility</span>
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
