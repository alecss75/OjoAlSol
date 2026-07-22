# OjoAlSol

OjoAlSol is a React web application for discovering the best nearby places to watch the sunset.

## Tech stack

- [React](https://react.dev/)
- [Vite](https://vite.dev/)

## External APIs (Free)

OjoAlSol integrates with three free APIs to provide comprehensive sunset viewing recommendations:

### 1. Sunrise-Sunset API
- **Purpose**: Get sunset/sunrise times and solar position data (azimuth, twilight times)
- **Documentation**: https://sunrise-sunset.org/api
- **Usage**: No API key required
- **Data provided**: Sunset time, sunrise time, solar noon, day length, civil/nautical/astronomical twilight

### 2. OpenWeatherMap API
- **Purpose**: Weather conditions including cloud coverage and visibility
- **Documentation**: https://openweathermap.org/api
- **API Key**: Required (free tier available)
- **Data provided**: Temperature, cloud coverage %, visibility, precipitation probability, wind
- **Setup**: Create `.env` file with `VITE_OPENWEATHER_API_KEY=your_key`

### 3. Overpass API (OpenStreetMap)
- **Purpose**: Find scenic locations (viewpoints, parks, beaches)
- **Documentation**: https://wiki.openstreetmap.org/wiki/Overpass_API
- **Usage**: No API key required
- **Data provided**: Location names, coordinates, descriptions, tags

## Getting started

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173` by default.

## Configuration

### Setting up OpenWeatherMap API Key

1. Get a free API key at https://openweathermap.org/api
2. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
3. Add your API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

## Available scripts

- `npm run dev` - start local development server
- `npm run build` - create a production build in `dist/`
- `npm run preview` - preview the production build locally
- `npm run lint` - run project lint checks

## Project structure

```text
src/
  components/         # Reusable UI components
  data/               # Static data placeholders
  services/           # API integration services
    index.js          # Service exports
    locationService.js          # Browser geolocation
    sunriseSunsetService.js     # Sunrise-Sunset API
    openWeatherService.js       # OpenWeatherMap API
    overpassService.js          # Overpass API (OpenStreetMap)
    sunsetSpotsService.js       # Combined spot finder
  App.jsx             # Main page composition
  App.css             # Landing page styles
  index.css           # Global styles
```

## Services Overview

### Location Service
- Get current user location via browser Geolocation API
- Watch location changes
- Format coordinates

### Sunrise-Sunset Service
- Fetch sunset/sunrise times for any location and date
- Calculate golden hour (hour before sunset)
- Get solar position data including azimuth

### OpenWeather Service
- Get current weather conditions
- Get 5-day weather forecast
- Calculate sunset quality score based on clouds, visibility, and precipitation

### Overpass Service
- Find viewpoints, parks, and beaches near a location
- Calculate distances between coordinates
- Query OpenStreetMap data

### Sunset Spots Service
- Combine all APIs to find best sunset spots
- Rank locations by distance and weather conditions
- Compare multiple spots for tomorrow's sunset
