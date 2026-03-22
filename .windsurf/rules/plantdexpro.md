# PlantDexPro — Project Rules & Constraints

## Project Identity
**PlantDexPro** is an AI-powered plant identification web application for MCA final-semester submission. It must be polished, truthful, academic, production-ready, and completely cost-free.

---

## Core Principles

### 1. Truthfulness Above All
- **NEVER invent nutrition values, protein values, mineral values, or plant facts**
- **NEVER leave the app stuck in "analyzing" or "calculating" states**
- If data is unavailable, show clear "Data unavailable" or "Not verified" messages
- Every result must include a truthful source/provenance label:
  - ✅ Verified Local Dataset
  - ✅ Verified Public Source
  - ⚠️ AI Inference Only
  - ❌ Data Unavailable

### 2. Cost-Free Architecture
- Use only free/open-source/free-tier services
- No paid APIs or premium services
- Prefer local datasets and caching over external API calls
- When external APIs are used, implement graceful fallbacks to local JSON or verified public content

### 3. Build Stability (Vercel/Linux Compatibility)
- **Preserve lowercase-safe filenames and imports** for Linux/Vercel compatibility
- No case-sensitive import path mismatches (e.g., `youtubeThumbnailCache.js` vs `youtubethumbnailcache.js`)
- Test builds locally before pushing to production
- Do not introduce new Vercel build issues

### 4. Security & Environment Variables
- Keep all secrets server-side only
- Frontend must use env-based backend URLs (`VITE_BACKEND_URL`), **never hardcoded localhost in production**
- Backend must read API keys from environment variables only
- No sensitive data in client-side code

### 5. Save Soil Theme Identity
- Keep the Save Soil theme **visible, lighter, and readable**
- Background should be warm earth tones, not too dark
- Watermark should be visible and elegant
- UI must feel academically professional, not generic

---

## Technical Standards

### Frontend (React + Vite)
- Use environment variables for all external URLs
- Implement layered fallback logic for all external data sources
- Show loading states only while data is truly being fetched
- Mobile-responsive and accessibility-friendly
- No broken imports or missing files

### Backend (Node.js + Express)
- Serve from Render or similar free-tier platform
- Use environment variables for all configuration
- Implement rate limiting and error handling
- CORS configured for production frontend URL

### Data Layer Strategy
1. **Local Verified Dataset** (highest priority)
2. **Free Public Web Content** (Wikipedia, open botanical databases)
3. **Free-Tier APIs** (if configured and available)
4. **Truthful Fallback** (clear "unavailable" message)

### Nutrition Data Rules
- Show vitamins/minerals/proteins **only when truly available**
- If nutrition field cannot be verified, label it as "Data not available for this species"
- Use ETL-verified data warehouse as primary source
- Cache AI-confirmed results for reuse
- Validate AI responses to prevent hallucinated filler text

---

## Feature Requirements

### Core Features (Must Have)
- ✅ Plant identification with confidence score
- ✅ Scientific and common names
- ✅ Edibility status with verification badge
- ✅ Nutrition profile (when available)
- ✅ Botanical usage and safety information
- ✅ XAI/explainability metrics (confidence, latency, feature contributions)
- ✅ Recipe video search (YouTube integration)
- ✅ Search history with local storage
- ✅ Verification cache for repeated searches

### Enhanced Features (Phase 2+)
- 🔄 User authentication (Firebase free tier or Passport.js)
- 🔄 Saved favorites and personalized history
- 🔄 User feedback for verification improvement
- 🔄 Wikipedia/botanical knowledge enrichment
- 🔄 Offline support with service workers

### Optional Enrichments (If Time Permits)
- ⏳ Plant disease/pest screening (if free model available)
- ⏳ Accessibility enhancements (react-aria)
- ⏳ Text-to-speech for descriptions
- ⏳ Daily "Plant Insight" rotating fact card
- ⏳ Weather/environmental context (free public data only)

---

## UI/UX Standards

### Result Display
- **One unified academic report-like panel** (not disconnected blocks)
- Green earth-tone card with hierarchical sections
- Accordion sections for mobile-friendly navigation
- Clear badges for verification status, edibility, confidence
- Honest fallback messages when data is unavailable

### Loading States
- Show dynamic inference milestones during processing
- Clear progress indicators
- No infinite "analyzing" loops

### Typography & Spacing
- Academic and professional tone
- High contrast for readability
- Mobile-responsive breakpoints
- Consistent spacing and alignment

---

## Deployment Checklist

### Before Every Deploy
1. ✅ Local build succeeds (`npm run build`)
2. ✅ No case-sensitive import issues
3. ✅ Environment variables configured correctly
4. ✅ No hardcoded localhost URLs in frontend
5. ✅ Backend URL points to production Render endpoint
6. ✅ All secrets are server-side only

### Vercel Frontend
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_BACKEND_URL`, `VITE_GEMINI_API_KEY` (if needed)

### Render Backend
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `GEMINI_API_KEY`, `PORT`, `FRONTEND_URL`

---

## Code Quality Rules

### General
- Keep codebase clean and consistent
- Use service wrappers for all external data sources
- Implement error boundaries and fallback UI
- Add comments for complex logic
- Follow existing code style

### Testing
- Verify all critical paths work
- Test with and without API keys configured
- Test mobile responsiveness
- Test fallback logic when APIs fail

### Documentation
- Update README with setup instructions
- Document environment variables
- Include deployment steps
- Prepare project report structure for MCA submission

---

## Forbidden Actions
- ❌ Do not invent or hallucinate data
- ❌ Do not leave UI stuck in loading states
- ❌ Do not hardcode localhost in production code
- ❌ Do not introduce case-sensitive filename issues
- ❌ Do not use paid APIs or services
- ❌ Do not make the Save Soil theme too dark or invisible
- ❌ Do not break the build on Vercel
- ❌ Do not expose secrets in client-side code

---

## Success Criteria
A successful PlantDexPro deployment means:
1. ✅ App builds and deploys without errors
2. ✅ Plant identification works with truthful results
3. ✅ Nutrition data shows real values or honest "unavailable" messages
4. ✅ Recipe videos load or show clean fallback
5. ✅ Save Soil theme is visible and elegant
6. ✅ XAI metrics provide transparent explanations
7. ✅ Mobile-responsive and accessible
8. ✅ Authentication and history work correctly
9. ✅ Documentation is complete for MCA submission
10. ✅ No cost incurred for any service used

---

**Last Updated:** March 22, 2026  
**Project Lead:** MCA Final Semester Student  
**AI Assistant:** Windsurf Cascade (SWE-1.5)
