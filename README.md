# OjoAlSol 🌅

**OjoAlSol** es una aplicación web React que te ayuda a descubrir los mejores lugares cercanos para contemplar la puesta de sol. Combina datos de localización, meteorología en tiempo real y mapas interactivos para recomendarte ubicaciones óptimas con puntuaciones de calidad basadas en condiciones reales.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Características Principales

### 🔍 Búsqueda Inteligente de Ubicaciones
- Detección automática de tu ubicación mediante Geolocation API
- Búsqueda de miradores, parques y playas en un radio de 10km
- Cálculo de distancia精确 a cada lugar
- Ordenación por proximidad

### 🌤️ Análisis Meteorológico en Tiempo Real
- **Puntuación de Calidad del Atardecer** (0-100): Algoritmo propio que considera:
  - Cobertura de nubes (%)
  - Visibilidad atmosférica (km)
  - Probabilidad de precipitación
  - Temperatura y humedad
- Actualización automática cada 5 minutos
- Condiciones de visibilidad: Excelente, Buena, Regular, Pobre

### ⏰ Información Solar Detallada
- Hora exacta del atardecer
- **Hora Dorada (Golden Hour)**: Cálculo automático (1 hora antes del atardecer)
- Duración del día civil
- Tiempos de twilight (civil, náutico, astronómico)

### 🗺️ Mapa Interactivo
- Integración con **Leaflet + OpenStreetMap**
- Marcadores personalizados por nivel de visibilidad
- Línea de ruta desde tu ubicación hasta el spot seleccionado
- Navegación "Mi Ubicación" para centrar el mapa
- Leyenda de colores para visibilidad

### ❤️ Sistema de Favoritos
- Guardar tus lugares preferidos con persistencia en localStorage
- Comparar hasta 3 spots simultáneamente
- Panel de comparación lado a lado con métricas:
  - Puntuación de calidad
  - Distancia
  - Visibilidad
  - Mejor hora de visita
- Eliminar favoritos individualmente o limpiar todos

### 📊 Historial de Visitas
- Registro automático al ver detalles de un spot
- Contador de visitas por lugar
- Fecha de última visita
- Estadísticas: total de visitas y lugares únicos visitados

### 🔔 Notificaciones Toast
- Feedback visual para acciones de usuario
- Tipos: éxito, error, advertencia
- Auto-desvanecimiento

## 🏛️ Vistas de la Aplicación

| Vista | Descripción | Componente |
|-------|-------------|------------|
| **Home** | Landing page con hero section, top 3 spots recomendados y accesos rápidos | `HomeView.jsx` |
| **Sunset Spots** | Lista completa de spots con tarjetas detalladas, filtros y métricas en tiempo real | `SunsetSpotsView.jsx` |
| **Map** | Mapa interactivo con marcadores, rutas y panel lateral de navegación | `MapView.jsx` |
| **Favorites** | Gestión de favoritos, comparación múltiple e historial de visitas | `FavoritesView.jsx` |

## 🛠️ Tech Stack

- **[React 18](https://react.dev/)** - UI library con hooks modernos
- **[Vite 5](https://vite.dev/)** - Build tool ultrarrápido
- **[Leaflet](https://leafletjs.com/)** - Mapas interactivos ligeros
- **CSS Moderno** - Variables CSS, Flexbox, Grid

## 🌐 APIs Externas (Gratuitas)

OjoAlSol integra tres APIs gratuitas para proporcionar recomendaciones completas:

### 1. Sunrise-Sunset API 🌞
- **Propósito**: Obtener tiempos de atardecer/amanecer y datos de posición solar
- **Documentación**: https://sunrise-sunset.org/api
- **API Key**: No requerida
- **Datos proporcionados**:
  - Hora de atardecer y amanecer
  - Mediodía solar
  - Duración del día
  - Civil/Nautical/Astronomical twilight

### 2. OpenWeatherMap API ☁️
- **Propósito**: Condiciones meteorológicas actuales
- **Documentación**: https://openweathermap.org/api
- **API Key**: Requerida (plan gratuito disponible)
- **Datos proporcionados**:
  - Temperatura (°C)
  - Cobertura de nubes (%)
  - Visibilidad (metros)
  - Humedad (%)
  - Probabilidad de precipitación
- **Configuración**: Crear archivo `.env` con `VITE_OPENWEATHER_API_KEY=tu_clave`

### 3. Overpass API (OpenStreetMap) 🗺️
- **Propósito**: Encontrar ubicaciones escénicas (miradores, parques, playas)
- **Documentación**: https://wiki.openstreetmap.org/wiki/Overpass_API
- **API Key**: No requerida
- **Datos proporcionados**:
  - Nombres de lugares
  - Coordenadas GPS
  - Descripciones y tags
  - Categorías (viewpoint, park, beach)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
cd /workspace

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se ejecuta en `http://localhost:5173` por defecto.

### Configuración de Variables de Entorno

1. Obtén una API key gratuita en https://openweathermap.org/api
2. Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   cp .env.example .env
   ```
3. Añade tu API key:
   ```env
   VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
   ```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con hot-reload |
| `npm run build` | Genera build de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta validación de código |

## 📁 Estructura del Proyecto

```text
src/
├── components/           # Componentes UI reutilizables
│   ├── SpotCard.jsx      # Tarjeta de spot con métricas
│   ├── HeroSection.jsx   # Hero banner
│   ├── NavBar.jsx        # Navegación principal
│   ├── RoadmapList.jsx   # Lista de roadmap
│   ├── PlaceholderCard.jsx
│   └── ui/
│       ├── ErrorBoundary.jsx
│       └── Toast.jsx     # Sistema de notificaciones
├── views/                # Vistas principales de la app
│   ├── HomeView.jsx              # Landing page
│   ├── SunsetSpotsView.jsx       # Lista de spots
│   ├── MapView.jsx               # Mapa interactivo
│   ├── FavoritesView.jsx         # Favoritos y comparación
│   └── index.js
├── services/             # Integración con APIs
│   ├── index.js
│   ├── locationService.js        # Geolocalización del navegador
│   ├── sunriseSunsetService.js   # API Sunrise-Sunset
│   ├── openWeatherService.js     # API OpenWeatherMap
│   ├── overpassService.js        # API Overpass (OSM)
│   └── sunsetSpotsService.js     # Servicio combinado
├── hooks/                # Custom React Hooks
│   ├── useFavorites.js           # Gestión de favoritos
│   ├── useVisitHistory.js        # Historial de visitas
│   └── useToast.jsx              # Notificaciones toast
├── constants/            # Constantes de la aplicación
│   ├── apiConstants.js
│   ├── mapConstants.js           # Configuración de mapas
│   └── qualityConstants.js       # Umbrales de calidad
├── utils/                # Utilidades
│   ├── validation.js
│   ├── qualityUtils.js
│   └── errors.js
├── data/                 # Datos estáticos
│   └── roadmap.js
├── config/               # Configuración
│   └── environment.js
├── App.jsx               # Composición principal
├── App.css               # Estilos de landing
├── index.css             # Estilos globales
└── main.jsx              # Entry point
```

## 🎯 Servicios y Lógica de Negocio

### Location Service
- Obtiene ubicación actual vía Browser Geolocation API
- Formatea coordenadas (lat/lng)
- Manejo de errores de permisos

### Sunrise-Sunset Service
- Fetch de tiempos solares para cualquier ubicación y fecha
- Cálculo de Golden Hour (1 hora antes del sunset)
- Soporte para fechas personalizadas (mañana, hoy)

### OpenWeather Service
- Condiciones meteorológicas actuales
- **`calculateSunsetQuality(weather)`**: Algoritmo que devuelve:
  - Score: 0-100
  - Calidad: Excellent, Good, Fair, Poor
- Factores ponderados: nubes, visibilidad, precipitación

### Overpass Service
- Queries a OpenStreetMap para encontrar:
  - Viewpoints (miradores)
  - Parks (parques)
  - Beaches (playas)
- Cálculo de distancias con fórmula Haversine
- Filtrado por radio (default: 10km)

### Sunset Spots Service (Orquestador)
- Combina las 3 APIs en paralelo con `Promise.all()`
- Enriquece cada spot con:
  - Distancia en km y metros
  - Datos solares
  - Weather actual
  - Quality score
- Funciones disponibles:
  - `findBestSunsetSpots(lat, lng, radius)`
  - `getSpotDetails(spot)`
  - `compareSpotsForTomorrow(spots[])`

## 🪝 Custom Hooks

### useFavorites
Gestión de favoritos con persistencia en localStorage:
- `favorites`: Array de spots guardados
- `toggleFavorite(spot)`: Añadir/eliminar
- `isFavorite(id)`: Check de estado
- `clearFavorites()`: Limpiar todo

### useVisitHistory
Seguimiento de visitas a spots:
- `addVisit(spot)`: Registrar visita
- `getVisitsCount(id)`: Total de visitas
- `getLastVisit(id)`: Fecha última visita
- `hasVisited(id)`: Check booleano
- `totalVisits`: Suma total de visitas
- `uniqueSpotsVisited`: Lugares únicos

### useToast
Sistema de notificaciones:
- `success(message)`: Toast verde
- `error(message)`: Toast rojo
- `warning(message)`: Toast amarillo

## 🎨 Componentes UI Destacados

### SpotCard
Tarjeta informativa con:
- Nombre y categoría del spot
- Distancia y visibilidad
- Hora de atardecer y golden hour
- Puntuación de calidad (badge coloreado)
- Botón de favoritos
- Descripción y horarios

### MapView Components
- `UserLocationMarker`: Marcador azul personalizado
- `RouteLine`: Línea punteada de ruta
- Marcadores dinámicos por visibilidad (colores)
- Overlay de controles flotantes

### Toast Notifications
- Posicionamiento fijo
- Animaciones de entrada/salida
- Múltiples tipos según acción

## 📊 Algoritmo de Calidad de Atardecer

La función `calculateSunsetQuality()` evalúa:

```javascript
Score Base: 50 puntos
+ Cobertura de nubes (0-30%): +30 pts
+ Visibilidad (>10km): +20 pts  
+ Sin precipitación: +10 pts
= Score Final (0-100)

Clasificación:
- 80-100: Excellent 🌟
- 60-79: Good 👍
- 40-59: Fair 👌
- 0-39: Poor 😞
```

## 🔮 Roadmap

Próximas características en desarrollo:
- [ ] Recomendaciones basadas en historial de visitas
- [ ] Fotos de usuarios por spot
- [ ] Predicción de calidad para próximos 7 días
- [ ] Exportar favoritos a Google Maps
- [ ] Modo oscuro
- [ ] PWA con soporte offline

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

---

Hecho con ❤️ para los amantes de las puestas de sol
