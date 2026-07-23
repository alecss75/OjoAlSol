import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { NavBar } from './components/NavBar'
import { HomeView, SunsetSpotsView, MapView, FavoritesView } from './views'
import { ToastContainer } from './components/ui/Toast'
import { ToastProvider, useToast } from './hooks/useToast.jsx'
import { SunsetDataProvider } from './context/SunsetDataContext.jsx'

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/spots" element={<SunsetSpotsView />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/favorites" element={<FavoritesView />} />
      </Routes>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <ToastProvider>
        <SunsetDataProvider>
          <AppContent />
        </SunsetDataProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
