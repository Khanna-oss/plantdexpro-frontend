# PlantDexPro Architecture

## Status
- Phase 1 complete: environmental HUD render gating hardened
- Phase 2 complete: results experience migrated to sci-fi HUD styling
- Phase 3 complete: public enrichment layer expanded across plant and geo research services
- Phase 4 complete: HBDO orchestration pipeline introduced
- Phase 5 complete: explainability and authenticated feedback capture added
- Phase 6 complete: documentation finalized and frontend build re-verified

## Current Runtime Flow
1. Upload begins in `src/App.jsx`
2. `src/services/hbdoPipelineService.js` preprocesses file input and compresses it through `src/utils/imageHelper.js`
3. `src/services/plantModelService.js` performs Gemini candidate extraction
4. `src/services/plantVerificationService.js` inspects retrieval signals and validates candidate matches
5. HBDO fallback reasoning records whether the result resolved through verified data, cache consensus, partial reference alignment, or truthful model-only fallback
6. Primary-candidate enrichment runs through nutrition lookup, Wikipedia, Trefle, IUCN, and Gemini-assisted YouTube discovery
7. `src/components/ResultsDisplay.jsx` renders botanical, conservation, XAI, and authenticated feedback panels
8. `src/App.jsx` conditionally mounts `GlobeEnvironmental` and `ResearchDataCards` only after a completed identification result exists

## Core Service Layers
- `src/services/plantdexservice.js` — thin facade over the HBDO pipeline and local history helpers
- `src/services/hbdoPipelineService.js` — preprocessing, retrieval, validation, fallback reasoning, and enrichment orchestration
- `src/services/plantModelService.js` — raw Gemini schema-driven candidate extraction
- `src/services/plantVerificationService.js` — verified catalog matching, cache consensus, and reference-signal inspection
- `src/services/identificationHistoryService.js` — recent discovery persistence in local storage
- `src/services/environmentalResearchService.js` — 9-source environmental aggregation with truthful fallback states
- `src/services/userDataService.js` — authenticated Firestore feedback capture for favorites, history, and verified review signals

## Current UI Layers
- `src/App.jsx` — global page orchestration, loading milestones, and environmental HUD gating
- `src/components/ImageUploader.jsx` — specimen submission and preview handoff
- `src/components/ResultsDisplay.jsx` — main botanical result console, conservation panels, XAI report, and feedback section
- `src/components/FeedbackButtons.jsx` — authenticated confirmation/correction capture for training review
- `src/components/GlobeEnvironmental.jsx` — rotating globe HUD with summary telemetry chips
- `src/components/ResearchDataCards.jsx` — detailed climate, soil, solar, and environmental research cards

## Architectural Invariants
- Environmental telemetry stays hidden until a successful identification result is present
- External enrichments must degrade to truthful unavailable states instead of fabricated data
- Save Soil landing visuals remain visually distinct from the post-identification HUD
- HBDO trace identifiers travel with active results and feedback payloads for auditability
- The existing Linux/Vercel `youtubeThumbnailCache.js` filename fix remains preserved
