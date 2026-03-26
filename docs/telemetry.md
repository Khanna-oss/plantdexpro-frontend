# Telemetry

## Status
- Phase 1 complete: visibility contract enforced
- Phase 2 complete: telemetry restyled into sci-fi HUD surfaces
- Phase 3 complete: telemetry expanded with soil and solar enrichment plus derived climate summaries
- Phase 6 complete: documentation aligned with the shipped telemetry surface

## Phase 1 Visibility Contract
Environmental telemetry must render only when a completed identification result exists.

## Render Conditions
Defined in `src/App.jsx`:

- valid identified plant exists
- analysis/loading is finished
- no active error
- inference milestone message is cleared

## Suppressed States
Telemetry is intentionally hidden during:

- landing page idle state
- upload in progress
- inference / milestone loading
- failed identification
- history browsing without an active result

## Current Telemetry Sources
- `src/services/geolocationService.js`
  - browser geolocation
  - 1-hour cached location
  - fallback coordinates: New Delhi
- `src/services/environmentalResearchService.js`
  - 24-hour cache for environmental lookups
  - OpenAQ / GFW / NASA POWER / Open-Meteo / GBIF / SoilGrids / Sunrise-Sunset aggregation
  - derived climate summary from NASA POWER + Open-Meteo
  - truthful unavailable states when upstream services fail or return no regional data

## Current Telemetry UI
- `src/components/GlobeEnvironmental.jsx`
  - air quality, forest cover, temperature, carbon, biodiversity, precipitation, solar flux, soil pH, and daylight chips
- `src/components/ResearchDataCards.jsx`
  - dedicated cards for climate, satellite, carbon, weather, biodiversity, soil, and solar/daylight
- `src/components/ResultsDisplay.jsx` radar tile for post-identification diagnostics

## Phase 2 HUD Notes
- telemetry cards now use monospace technical labeling
- dark rectangular panels with neon green borders and glow accents
- amber warning states for unavailable data
- radar visualization appears only inside the completed result console

## Invariants
- telemetry remains hidden until a completed identification result exists
- environmental lookups are location-aware but must fall back gracefully when geolocation or upstream services fail
- climate metrics shown in the HUD must be derived from real upstream sources instead of placeholder projections
