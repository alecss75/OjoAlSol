/**
 * PWA utilities for service worker registration and offline support
 */

import { registerSW } from 'virtual:pwa-register';

/**
 * Register the service worker for PWA support
 */
export function registerPWA(): void {
  if ('serviceWorker' in navigator) {
    registerSW({
      onNeedRefresh() {
        // Show a toast or notification to the user that an update is available
        if (confirm('New version available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
        // Could show a toast: "App is ready for offline use!"
      },
      onRegistered(swRegistration) {
        console.log('Service worker registered:', swRegistration);
      },
      onRegisterError(error) {
        console.error('Service worker registration failed:', error);
      },
    });
  }
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Check if app can be installed
 */
export function canInstall(): boolean {
  return !isStandalone() && 'serviceWorker' in navigator;
}

/**
 * Prompt user to install the PWA
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    // Could dispatch custom event to show install button
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    deferredPrompt = null;
    return true;
  }
  return false;
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Detect online/offline status
 */
export function setupOnlineDetection(onOnline?: () => void, onOffline?: () => void): () => void {
  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Check if we're currently online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}