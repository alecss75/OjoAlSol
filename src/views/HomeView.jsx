import { SpotCard, QuickAccessCard } from '../components/SpotCard'
import { useSunsetData } from '../hooks/useSunsetData.js'
import { SunStatusBanners } from '../components/SunStatusBanners.jsx'

/**
 * Home view - Landing page with hero section and roadmap
 */
export function HomeView() {
  const {
    spots,
    loading,
    error,
    sunData,
    calculateSpotQuality,
    getVisibilityDescription,
    formatTime,
    fetchLocationAndSpots
  } = useSunsetData()

  // Map real spots to the format expected by SpotCard, take top 3
  const topSpots = spots.slice(0, 3).map((spot) => ({
    id: spot.id,
    name: spot.name,
    distance: `${spot.distanceKm} km`,
    qualityScore: calculateSpotQuality(spot),
    visibility: getVisibilityDescription(),
    bestTime: sunData?.sunset ? formatTime(sunData.sunset) : '--:--',
    description: spot.description || `Scenic ${spot.category || 'spot'} for sunset viewing`,
    latitude: spot.latitude,
    longitude: spot.longitude,
  }))


  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Find the best nearby places to watch the sunset</h1>
        <p className="hero-copy">
          OjoAlSol helps you discover scenic viewpoints around you and choose the best
          location before the sun goes down.
        </p>
        
        {/* Sun status banners */}
        <SunStatusBanners sunData={sunData} />
      </header>

      <section className="panel-grid" aria-label="Top sunset spots near you">
        {loading ? (
          <div className="loading-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
            <p>Finding the best spots near you...</p>
          </div>
        ) : error ? (
          <div className="error-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p className="error-message">⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchLocationAndSpots} style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        ) : topSpots.length === 0 ? (
          <div className="no-spots" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p>No sunset spots found nearby. Try exploring the map.</p>
          </div>
        ) : (
          topSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))
        )}
      </section>

      <section className="quick-access-section" aria-label="Quick access to other views">
        <h2>Explore More</h2>
        <div className="panel-grid">
          <QuickAccessCard
            title="All Sunset Spots"
            description="Browse all recommended locations with quality scores and details"
            icon="📍"
            linkTo="/spots"
            linkLabel="View All Spots"
          />
          <QuickAccessCard
            title="Interactive Map"
            description="See locations on a map with route guidance and orientation cues"
            icon="🗺️"
            linkTo="/map"
            linkLabel="Open Map"
          />
          <QuickAccessCard
            title="Favorites"
            description="Save and compare your favorite sunset locations"
            icon="❤️"
            linkTo="/favorites"
            linkLabel="View Favorites"
          />
        </div>
      </section>

      <section className="roadmap" aria-label="Product roadmap">
        <h2>What we are building next</h2>
        <ul>
          <li>Location-aware sunset recommendations</li>
          <li>Spot details with photos, weather, and horizon quality</li>
          <li>Save favorite places and compare tomorrow's sunset options</li>
        </ul>
      </section>
    </main>
  )
}
