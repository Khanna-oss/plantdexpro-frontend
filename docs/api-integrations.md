# API Integrations

## Status
- Phase 3 complete: public enrichment layer expanded across plant and geo research services
- Phase 4 complete: HBDO orchestration now centralizes plant identification and enrichment handoff
- Phase 5 complete: authenticated feedback payloads now persist plant, HBDO, and XAI snapshots

## Plant Identification and Orchestration
- Google Gemini — schema-constrained plant candidate extraction through `src/services/plantModelService.js`
- HBDO pipeline — orchestration across preprocessing, retrieval, validation, fallback reasoning, and enrichment in `src/services/hbdoPipelineService.js`

## Plant Enrichment APIs
- Wikipedia / MediaWiki — educational plant summaries and related article discovery
- Trefle — botanical taxonomy, growth, and distribution enrichment
- IUCN Red List — optional conservation status enrichment via `VITE_IUCN_API_TOKEN` or `VITE_IUCN_API_KEY`
- Gemini Google Search tool — recipe or care video discovery routed through the existing Gemini API key

## Nutrition Data Sources
- ETL Nutrition Warehouse — verified species-specific nutrition references
- USDA FoodData Central — free public fallback via `VITE_USDA_API_KEY` or `DEMO_KEY`

## Environmental and Location APIs
- OpenAQ — air quality
- Global Forest Watch — deforestation context
- NASA POWER — satellite precipitation, temperature, and solar radiation
- Open-Meteo — current and historical weather context
- GBIF — biodiversity occurrence counts
- Nominatim — reverse geolocation
- SoilGrids (ISRIC) — surface soil chemistry and texture
- Sunrise-Sunset.org — sunrise, sunset, solar noon, and daylight windows

## Auth and Feedback Infrastructure
- Firebase Authentication — authenticated user identity
- Firestore — favorites, history, and verified feedback capture
- Unsplash — dynamic landing backgrounds

## Fallback Principle
Every external fetch must degrade to truthful unavailable states instead of fabricated data.

## Caching Notes
- Most public enrichment services cache client-side through local storage with time-based invalidation
- Environmental telemetry caches by coarse geo buckets for 24 hours
- IUCN and USDA-backed nutrition lookups use longer-lived local caches because the reference data is relatively stable

## Required and Optional Client Variables
- Required: `VITE_GEMINI_API_KEY`
- Optional plant enrichment: `VITE_TREFLE_API_KEY`, `VITE_IUCN_API_TOKEN`, `VITE_IUCN_API_KEY`
- Optional nutrition fallback: `VITE_USDA_API_KEY`
- Required for auth and feedback capture: Firebase `VITE_FIREBASE_*` variables

## Deployment Note
Client-side API variables must use the `VITE_` prefix to be injected by Vite and Vercel.
