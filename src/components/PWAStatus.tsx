/**
 * PWA status indicator and install prompt component
 */

import { useState, useEffect } from 'react';
import { registerPWA, setupInstallPrompt, promptInstall, isStandalone, setupOnlineDetection, isOnline } from '../utils/pwa';

export function PWAStatus() {
  const [canInstallApp, setCanInstallApp] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [isInstalled, setIsInstalled] = useState(isStandalone());

  useEffect(() => {
    registerPWA();
    setupInstallPrompt();

    const handleInstallAvailable = () => setCanInstallApp(true);
    const handleInstalled = () => {
      setCanInstallApp(false);
      setIsInstalled(true);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    const cleanupOnline = setupOnlineDetection(handleOnline, handleOffline);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      cleanupOnline();
    };
  }, []);

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setCanInstallApp(false);
    }
  };

  // Don't show anything if already installed
  if (isInstalled) return null;

  return (
    <div className="pwa-status-bar" role="status" aria-live="polite">
      {isOffline && (
        <div className="pwa-status-item offline">
          <span className="pwa-icon">📴</span>
          <span>Offline mode - using cached data</span>
        </div>
      )}

      {canInstallApp && (
        <div className="pwa-status-item install">
          <span className="pwa-icon">📱</span>
          <span>Install OjoAlSol for offline access</span>
          <button className="btn-sm btn-primary" onClick={handleInstallClick}>
            Install
          </button>
        </div>
      )}
    </div>
  );
}

export default PWAStatus;