import { roadmapItems } from '../data/roadmap'

export function RoadmapList() {
  return (
    <section className="roadmap" aria-label="Product roadmap">
      <h2>What we are building next</h2>
      <ul>
        {roadmapItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
