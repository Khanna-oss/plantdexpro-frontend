# UI Components

## Status
- Phase 1 complete: environmental HUD visibility logic updated
- Phase 2 complete: post-identification HUD redesign applied
- Phase 3 complete: telemetry cards and conservation surfaces expanded
- Phase 4 complete: UI now consumes HBDO-backed results
- Phase 5 complete: XAI reasoning and authenticated feedback capture added
- Phase 6 complete: documentation aligned with the shipped UI surface

## Component Map
- `Header` — top navigation and auth controls
- `SoilBackground` — Save Soil landing visuals
- `ImageUploader` — upload and analyze trigger
- `Spinner` — milestone-based loading feedback
- `ResultsDisplay` — main plant result interface
- `GlobeEnvironmental` — rotating globe telemetry block
- `ResearchDataCards` — environmental detail cards
- `Footer` — page footer

## Phase 2 HUD Layer
The sci-fi HUD is intentionally scoped to the post-identification experience.

- `ResultsDisplay`
  - dark rectangular console shell
  - monospace technical labels
  - neon green confidence and verification indicators
  - amber warning treatment for unavailable or unsafe data
  - animated radar tile inside the XAI block
  - HBDO reasoning tiles for retrieval, validation, fallback, and enrichment
  - authenticated feedback capture panel with HBDO trace token
- `ResearchDataCards`
  - terminal telemetry cards
  - technical source labels
  - neon-accented location and metric headers
  - climate, satellite, soil, and solar/daylight cards using truthful Phase 3 metrics
- `GlobeEnvironmental`
  - remains part of the result-only telemetry stack established in Phase 1
  - now summarizes precipitation, solar flux, soil pH, and daylight windows

## Result Experience Notes
- `ResultsDisplay` consumes the active HBDO plant object and remains compatible with multi-candidate switching
- conservation rendering uses local verified data first, then optional IUCN enrichment when available
- signed-out users see a truthful sign-in prompt instead of hidden feedback controls
- signed-in users can submit authenticated confirmation or correction payloads for review

## Hidden When
- before any identification
- while analyzing
- when an error is shown
- when only recent history is visible

## Preserved
- Save Soil landing-page theme
- prior result logic
- existing thumbnail cache deployment fix

## Current UI Direction
The UI now intentionally keeps a split identity:

- Save Soil visual language on the landing page
- sci-fi HUD styling only after a completed identification result
- explainability, telemetry, and feedback surfaces embedded inside the post-identification console
