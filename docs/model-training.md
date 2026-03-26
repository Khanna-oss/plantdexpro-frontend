# Model Training

## Status
- Phase 5 complete: authenticated feedback capture now records structured review signals
- Phase 6 complete: training-data documentation aligned with the shipped frontend behavior

## Current Training Data Direction
The frontend now captures authenticated review signals that can support later retrieval refinement, evaluation, and supervised review without automatically retraining the model on the client.

## Captured Feedback Signals
- confirmed identification
- corrected plant name
- optional reviewer comments
- verification status and verification level at submission time
- HBDO retrieval, validation, fallback, and enrichment snapshots
- XAI confidence, latency, and feature-importance snapshots

## Current Storage Contract
- feedback is only submitted by authenticated users
- feedback records are written through `src/services/userDataService.js`
- payloads include `plantSnapshot`, `hbdoSnapshot`, and `xaiSnapshot`
- trace IDs from the HBDO pipeline allow a feedback item to be linked back to a specific identification session and candidate

## Invariants
- no client-side feedback submission should imply that model weights changed immediately
- truthful source data must remain separate from user-provided corrections
- signed-out users may view results but cannot submit verified review data

## Intended Outcome
Create a lightweight audited dataset that can support retrieval refinement, review tooling, and confidence calibration without overwriting truthful source data or fabricating labels.
