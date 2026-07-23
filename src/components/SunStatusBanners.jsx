export function SunStatusBanners({ sunData }) {
  if (!sunData) return null

  const isSunsetHappeningNow = () => {
    if (!sunData?.sunset) return false
    
    const now = new Date()
    const sunsetTime = new Date(sunData.sunset)
    const goldenHourStart = new Date(sunsetTime.getTime() - 60 * 60 * 1000) // 1 hour before
    const sunsetEnd = new Date(sunsetTime.getTime() + 15 * 60 * 1000) // 15 mins after
    
    return now >= goldenHourStart && now <= sunsetEnd
  }

  const isSunriseHappeningNow = () => {
    if (!sunData?.sunrise) return false
    
    const now = new Date()
    const sunriseTime = new Date(sunData.sunrise)
    const sunriseStart = new Date(sunriseTime.getTime() - 15 * 60 * 1000) // 15 mins before
    const sunriseEnd = new Date(sunriseTime.getTime() + 60 * 60 * 1000) // 1 hour after
    
    return now >= sunriseStart && now <= sunriseEnd
  }

  if (isSunsetHappeningNow()) {
    return (
      <div className="sunset-happening-banner" style={{
        backgroundColor: 'var(--color-primary, #ff7b54)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <span>🌅</span>
        <span>The sunset is happening right now! Get to a spot quickly!</span>
        <span>🌅</span>
      </div>
    )
  }

  if (isSunriseHappeningNow()) {
    return (
      <div className="sunset-happening-banner" style={{
        backgroundColor: '#FFB347',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <span>🌄</span>
        <span>The sunrise is happening right now! Enjoy the morning light!</span>
        <span>🌄</span>
      </div>
    )
  }

  return (
    <div className="no-sun-banner" style={{
      backgroundColor: '#4A5568',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }}>
      <span>🌙</span>
      <span>Ups there is no sunset or sunrise right now!</span>
      <span>🌙</span>
    </div>
  )
}
