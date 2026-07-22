import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { NavBar } from './components/NavBar'
import { HomeView, SunsetSpotsView, MapView, FavoritesView } from './views'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/spots" element={<SunsetSpotsView />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/favorites" element={<FavoritesView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
