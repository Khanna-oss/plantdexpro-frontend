# Deployment

## Current Targets
- Vercel
- Render

## Status
- Phase 1 preserved the deployment-sensitive filename fix for `youtubeThumbnailCache.js`
- Phase 3 added optional public enrichment variables for Trefle and IUCN
- Phase 5 made Firebase auth and Firestore feedback capture part of the live frontend path
- Phase 6 re-verified the frontend build after the full documentation pass

## Important Constraints
- Preserve the existing Linux/Vercel filename fix for `youtubeThumbnailCache.js`
- Do not rename deployment-sensitive files unless necessary
- Client environment variables must use `VITE_` prefixes

## Required Client Variables
- `VITE_GEMINI_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Optional Client Variables
- `VITE_USDA_API_KEY` — higher-rate USDA nutrition fallback
- `VITE_TREFLE_API_KEY` — richer botanical enrichment
- `VITE_IUCN_API_TOKEN` or `VITE_IUCN_API_KEY` — optional conservation enrichment
- `VITE_UNSPLASH_ACCESS_KEY` — dynamic landing backgrounds
- `VITE_BACKEND_URL` — reserved for future backend integration

## Current Static Routing Files
- `vercel.json`
- `render.yaml`

## Deployment Notes
- Without Firebase variables, auth-gated feedback capture will not function correctly
- Without the optional IUCN token, conservation UI falls back to a truthful unavailable state
- Without optional Trefle or USDA keys, the app remains functional and uses truthful degraded fallbacks where needed
- Vite build verification should be run with `npm run build` before deployment

## Latest Verification
- Final frontend build completed successfully during Phase 6
- Existing Vite chunk-size warning remains non-blocking and does not prevent deployment
