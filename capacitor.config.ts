import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ojoalsol.app',
  appName: 'OjoAlSol',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ff6b35',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ff6b35'
    },
    Geolocation: {
      enableHighAccuracy: true
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ff6b35',
      sound: 'beep.wav'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keyPassword: undefined
    }
  }
};

export default config;