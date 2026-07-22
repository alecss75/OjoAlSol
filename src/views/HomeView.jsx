import { SpotCard, QuickAccessCard } from '../components/SpotCard'

/**
 * Home view - Landing page with hero section and roadmap
 */
export function HomeView() {
  const topSpots = [
    {
      id: 1,
      name: 'Playa Norte',
      distance: '6.5 km',
      qualityScore: 9.2,
      visibility: 'Perfect',
      bestTime: '19:40',
      description: 'Beachfront location with unobstructed ocean views',
    },
    {
      id: 2,
      name: 'Mirador del Valle',
      distance: '2.3 km',
      qualityScore: 8.5,
      visibility: 'Excellent',
      bestTime: '19:45',
      description: 'Panoramic view of the valley with western horizon exposure',
    },
    {
      id: 3,
      name: 'Colina de las Flores',
      distance: '4.1 km',
      qualityScore: 7.8,
      visibility: 'Good',
      bestTime: '19:50',
      description: 'Elevated hilltop with minimal obstructions',
    },
  ]

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">OjoAlSol</p>
        <h1>Find the best nearby places to watch the sunset</h1>
        <p className="hero-copy">
          OjoAlSol helps you discover scenic viewpoints around you and choose the best
          location before the sun goes down.
        </p>
      </header>

      <section className="panel-grid" aria-label="Top sunset spots near you">
        {topSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
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
