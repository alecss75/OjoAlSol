import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ToastProvider, useToast } from './hooks/useToast';
import { ToastContainer } from './components/ui/Toast';
import { NavBar } from './components/NavBar';
import { PWAStatus } from './components/PWAStatus';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy load views for code splitting
const HomeView = lazy(() => import('./views/HomeView'));
const SunsetSpotsView = lazy(() => import('./views/SunsetSpotsView'));
const MapView = lazy(() => import('./views/MapView'));
const FavoritesView = lazy(() => import('./views/FavoritesView'));

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <NavBar />
      <PWAStatus />
      <Suspense fallback={<div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/spots" element={<SunsetSpotsView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/favorites" element={<FavoritesView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;