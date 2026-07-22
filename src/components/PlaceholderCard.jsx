export function PlaceholderCard({ title, description, badge }) {
  return (
    <article className="placeholder-card">
      <span className="badge">{badge}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  )
}
