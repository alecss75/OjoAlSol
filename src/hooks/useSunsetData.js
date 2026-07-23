import { useContext } from 'react'
import { SunsetDataContext } from '../context/SunsetDataContext.jsx'

export function useSunsetData() {
  const context = useContext(SunsetDataContext)
  
  if (context === null) {
    throw new Error('useSunsetData must be used within a SunsetDataProvider')
  }
  
  return context
}
