# OjoAlSol - project instructions

App web React para encontrar los mejores lugares cercanos para ver la puesta de sol.
Combina geolocalizacion, meteorologia en tiempo real y mapas Leaflet.

## Commands

```bash
npm run dev      # dev server, http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

Node.js 18+. The project is ESM (`"type": "module"` in package.json).

Run `npm run lint` after changing files under `src/`, and `npm run build`
before declaring a change complete.

## Architecture

- **Vite + React 19**, not React 18. The README badges still say 18, and the
  documented `src/` tree is out of date; trust the source, not the README.
- **Routing**: `react-router-dom` v7.
- **UI**: MUI v9 and Emotion. Plain CSS is also in use for the landing page.
- **Map**: Leaflet 1.9 via `react-leaflet` 5. Any marker, layer, or route-line
  change needs the Leaflet CSS imported in the same module.

## Environment

`.env` holds `VITE_OPENWEATHER_API_KEY`. It is gitignored. Never read it and
never paste its value into a commit, a log, or a reply. Vite inlines
`VITE_*` variables into the client bundle, so this key is already public to
anyone using the app; it must stay a rate-limited key with no other privileges.

## Conventions

- API calls live in `src/services/`. Each external API has its own service
  module, with `sunsetSpotsService` orchestrating them via `Promise.all`.
- React state that survives a reload belongs in a custom hook under `src/hooks/`.
  Favorites and visit history persist to `localStorage` there, not in a store.
- Thresholds for the sunset quality score are constants in
  `src/constants/qualityConstants.js`, not inline literals.
- `calculateSunsetQuality(weather)` in the weather service returns a 0-100 score
  and a label. If you change the weighting, update the table in the README.

## Scope

This session is isolated to this directory. Paths outside it, including sibling
projects under `proyectos-personales`, are denied by `opencode.jsonc`.
