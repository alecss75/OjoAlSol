import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'OjoAlSol',
        short_name: 'OjoAlSol',
        description: 'Find the best nearby places to watch the sunset',
        theme_color: '#ff6b35',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['weather', 'travel', 'navigation'],
        screenshots: [],
        shortcuts: [
          {
            name: 'Sunset Spots',
            short_name: 'Spots',
            description: 'View nearby sunset spots',
            url: '/spots',
            icons: [{ src: 'icons.svg', sizes: '96x96' }],
          },
          {
            name: 'Map',
            short_name: 'Map',
            description: 'Open interactive map',
            url: '/map',
            icons: [{ src: 'icons.svg', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://api.openweathermap.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openweather-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://api.sunrise-sunset.org',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sunrise-sunset-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.origin.includes('overpass-api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'overpass-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 30,
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://tile.openstreetmap.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://unpkg.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    rolldownOptions: {
      external: ['react-leaflet', 'leaflet']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  }
})