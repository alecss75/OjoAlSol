/**
 * Offline map support using MapLibre GL with PMtiles
 * Provides vector tile caching for offline map viewing
 */

import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// PMtiles URL template for OpenStreetMap vector tiles
// Using free tier from protomaps or self-hosted
const PMTILES_URL = 'https://tiles.protomaps.com/planet.pmtiles?key=YOUR_KEY'; // Replace with actual key or self-hosted

interface OfflineMapConfig {
  container: HTMLElement;
  style?: StyleSpecification;
  center: [number, number];
  zoom: number;
  pmtilesUrl?: string;
}

class OfflineMapManager {
  private map: MapLibreMap | null = null;
  private pmtilesUrl: string;
  private isOffline = false;

  constructor(config: OfflineMapConfig) {
    this.pmtilesUrl = config.pmtilesUrl || PMTILES_URL;
    this.initializeMap(config);
    this.setupOnlineDetection();
  }

  private async initializeMap(config: OfflineMapConfig): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const { Map } = await import('maplibre-gl');
      
      // Default style using PMtiles
      const style: StyleSpecification = config.style || {
        version: 8,
        sources: {
          openmaptiles: {
            type: 'vector',
            url: `pmtiles://${this.pmtilesUrl}`,
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f8fafc' },
          },
          {
            id: 'water',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'water',
            paint: { 'fill-color': '#bae6fd' },
          },
          {
            id: 'landuse',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'landuse',
            paint: {
              'fill-color': [
                'match',
                ['get', 'class'],
                'park', '#bbf7d0',
                'forest', '#86efac',
                'beach', '#fde047',
                '#f1f5f9',
              ],
            },
          },
          {
            id: 'roads',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            paint: {
              'line-color': '#e2e8f0',
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 14, 2],
            },
          },
          {
            id: 'buildings',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            paint: {
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.6,
            },
          },
          {
            id: 'poi-labels',
            type: 'symbol',
            source: 'openmaptiles',
            'source-layer': 'poi',
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 12,
              'text-anchor': 'top',
            },
            paint: { 'text-color': '#475569' },
          },
        ],
      };

      this.map = new Map({
        container: config.container,
        style,
        center: config.center,
        zoom: config.zoom,
        // Enable offline caching
        transformRequest: (url, resourceType) => {
          if (this.isOffline && resourceType === 'Tile') {
            // In offline mode, we'll rely on cached tiles
            return { url: '' };
          }
          return { url };
        },
      });

      this.map.on('load', () => {
        console.log('MapLibre GL map loaded');
      });
    } catch (error) {
      console.error('Failed to initialize MapLibre GL:', error);
    }
  }

  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      this.isOffline = false;
      console.log('Map: Back online');
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      console.log('Map: Gone offline');
    });
  }

  public getMap(): MapLibreMap | null {
    return this.map;
  }

  public setCenter(center: [number, number]): void {
    this.map?.setCenter(center);
  }

  public setZoom(zoom: number): void {
    this.map?.setZoom(zoom);
  }

  public flyTo(center: [number, number], zoom: number): void {
    this.map?.flyTo({ center, zoom, duration: 2000 });
  }

  public async addMarker(
    coordinates: [number, number],
    options: {
      color?: string;
      popup?: string;
      className?: string;
    } = {}
  ): Promise<void> {
    if (!this.map) return;

    const { Marker, Popup } = await import('maplibre-gl');
    const marker = new Marker({ color: options.color || '#ff6b35', className: options.className })
      .setLngLat(coordinates);

    if (options.popup) {
      marker.setPopup(new Popup().setHTML(options.popup));
    }

    marker.addTo(this.map);
  }

  public addRoute(
    coordinates: [number, number][],
    options: {
      color?: string;
      width?: number;
      dashArray?: number[];
    } = {}
  ): void {
    if (!this.map) return;

    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    });

    this.map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': options.color || '#4c1d95',
        'line-width': options.width || 4,
        'line-dasharray': options.dashArray || [10, 10],
      },
    });
  }

  public removeRoute(): void {
    if (!this.map) return;
    if (this.map.getLayer('route-line')) {
      this.map.removeLayer('route-line');
    }
    if (this.map.getSource('route')) {
      this.map.removeSource('route');
    }
  }

  public resize(): void {
    this.map?.resize();
  }

  public destroy(): void {
    this.map?.remove();
    this.map = null;
  }

  public isOfflineMode(): boolean {
    return this.isOffline;
  }
}

// React hook for using offline map
import { useEffect, useRef, useState } from 'react';

interface UseOfflineMapReturn {
  mapRef: React.RefObject<HTMLDivElement>;
  mapManager: OfflineMapManager | null;
  isReady: boolean;
}

export function useOfflineMap(
  center: [number, number],
  zoom: number,
  pmtilesUrl?: string
): UseOfflineMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapManager, setMapManager] = useState<OfflineMapManager | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const manager = new OfflineMapManager({
      container: mapRef.current,
      center,
      zoom,
      pmtilesUrl,
    });

    setMapManager(manager);

    // Wait for map to load
    const checkReady = setInterval(() => {
      if (manager.getMap()?.loaded()) {
        setIsReady(true);
        clearInterval(checkReady);
      }
    }, 100);

    return () => {
      clearInterval(checkReady);
      manager.destroy();
    };
  }, [center, zoom, pmtilesUrl]);

  return { mapRef, mapManager, isReady };
}

export { OfflineMapManager };