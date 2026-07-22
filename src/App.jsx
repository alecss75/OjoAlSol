import './App.css'
import { HeroSection } from './components/HeroSection'
import { PlaceholderCard } from './components/PlaceholderCard'
import { RoadmapList } from './components/RoadmapList'

function App() {
  return (
    <main className="app-shell">
      <HeroSection />

      <section className="panel-grid" aria-label="Upcoming OjoAlSol experience">
        <PlaceholderCard
          title="Sunset spots near you"
          description="Nearby recommendations will appear here with quality scores, visibility notes, and best arrival times."
          badge="Coming soon"
        />
        <PlaceholderCard
          title="Map and route preview"
          description="An interactive map with orientation cues and route guidance will be integrated in the next phase."
          badge="Planned"
        />
      </section>

      <RoadmapList />
    </main>
  )
}

export default App
