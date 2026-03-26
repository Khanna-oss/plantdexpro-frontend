# Explainability

## Status
- Existing XAI-style UI present
- Phase 2 complete: XAI rendered through sci-fi HUD diagnostics
- Phase 4 complete: HBDO pipeline now provides explicit retrieval, validation, fallback, and enrichment metadata
- Phase 5 complete: XAI surface expanded and authenticated feedback capture added
- Phase 6 complete: documentation aligned with the shipped explainability system

## Current Explainability Sources
- `src/services/hbdoPipelineService.js`
  - `hbdoMeta.retrieval`
  - `hbdoMeta.validation`
  - `hbdoMeta.fallbackReasoning`
  - `hbdoMeta.enrichment`
  - `xaiMeta.confidence`
  - `xaiMeta.inferenceLatencyMs`
  - `xaiMeta.retrievalSource`
  - `xaiMeta.matchTier`
  - `xaiMeta.fallbackStrategy`
  - `xaiMeta.stageSummary`
  - `xaiMeta.featureImportance`
- `src/components/ResultsDisplay.jsx`
  - confidence rendering
  - feature contribution cards
  - verification and provenance indicators
  - HBDO reasoning tiles for retrieval, validation, fallback, and enrichment
  - trace token surfaced near the feedback capture block
- `src/components/FeedbackButtons.jsx`
  - authenticated confirmation/correction capture using HBDO and XAI snapshots

## Phase 1 Scope
No explainability logic changed in Phase 1. The only change was environmental HUD visibility gating.

## Phase 2 Scope
No new explainability model logic was introduced in Phase 2. The update was presentational:

- terminal-style XAI diagnostics container
- radar tile for post-identification visual targeting
- neon confidence rendering and stricter telemetry labels
- retained confidence, latency, provenance, and feature-importance logic

## Current Explainability Contract
- feature bars remain presentation-oriented and are derived from `visualFeatures`
- retrieval and validation reasoning now come from the HBDO pipeline instead of ad hoc UI inference
- fallback strategies are explicit and truth-preserving
- authenticated feedback submissions attach plant, HBDO, and XAI snapshots for later review

## Invariants
- explainability surfaces must not fabricate confidence sources or provenance
- unsigned users may view diagnostics but cannot submit verified feedback
- the Save Soil landing page remains separate from the post-identification explainability HUD
