/**
 * MapView - View for displaying interactive map with sunset spots
 * Shows locations on a map with route guidance and orientation cues
 */
export function MapView() {
  const mockLocations = [
    { id: 1, name: 'Mirador del Valle', lat: 40.4168, lng: -3.7038 },
    { id: 2, name: 'Colina de las Flores', lat: 40.4200, lng: -3.6950 },
    { id: 3, name: 'Playa Norte', lat: 40.4350, lng: -3.7100 },
  ]

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
        <div className="map-placeholder">
          <div className="map-mockup">
            <div className="map-grid"></div>
            {mockLocations.map((location) => (
              <div key={location.id} className="map-marker" style={{
                top: `${20 + location.id * 25}%`,
                left: `${30 + location.id * 20}%`,
              }}>
                <span className="marker-pin">📍</span>
                <span className="marker-label">{location.name}</span>
              </div>
            ))}
          </div>
          <div className="map-controls">
            <button className="btn-secondary">🔍 Search area</button>
            <button className="btn-secondary">🧭 My location</button>
            <button className="btn-primary">🚀 Navigate to spot</button>
          </div>
        </div>

        <aside className="map-sidebar">
          <h2>Nearby Spots</h2>
          <ul className="spots-list">
            {mockLocations.map((location) => (
              <li key={location.id} className="spot-item">
                <strong>{location.name}</strong>
                <span className="spot-coords">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
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
          </div>
        </aside>
      </section>
    </main>
  )
}
