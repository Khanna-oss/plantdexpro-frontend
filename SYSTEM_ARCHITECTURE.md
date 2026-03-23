# PlantDexPro - System Architecture Documentation

## MCA Research Project - Save Soil Initiative

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Overview](#system-overview)
3. [Architecture Diagram](#architecture-diagram)
4. [Core Modules](#core-modules)
5. [Environmental Research APIs](#environmental-research-apis)
6. [Firebase Integration](#firebase-integration)
7. [Data Flow](#data-flow)
8. [Security & Performance](#security--performance)

---

## Technology Stack

### Frontend Framework
- **React 18.2** - UI library with hooks and context API
- **Vite 5.4** - Build tool and development server
- **Framer Motion 11.0** - Animation library for smooth transitions
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library

### AI & Machine Learning
- **Google Gemini 3 Flash** - Plant identification AI model
- **@google/genai** - Official Gemini SDK

### Backend Services
- **Firebase Authentication** - User authentication and session management
- **Firebase Firestore** - NoSQL database for user data, history, and favorites

### Environmental Data APIs (7 Modules)
1. **OpenAQ API** - Real-time air quality data
2. **Global Forest Watch API** - Deforestation and forest cover data
3. **World Bank Climate API** - Climate resilience and trends
4. **NASA POWER API** - Satellite vegetation and climate data
5. **Carbon Intensity API** - Electricity carbon footprint
6. **Open Meteo API** - Weather history and forecasting
7. **GBIF API** - Biodiversity and species occurrence data

### Additional APIs
- **Trefle API** - Botanical enrichment data
- **Wikipedia API** - Educational plant summaries
- **Unsplash API** - Dynamic nature background images

### Testing
- **Jest 30.3** - JavaScript testing framework
- **React Testing Library 16.3** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers

---

## System Overview

PlantDexPro is a comprehensive plant identification and environmental research platform that combines AI-powered plant recognition with real-time environmental data to provide users with holistic botanical insights.

### Key Features
1. **AI Plant Identification** - Gemini 3 Flash model for accurate species recognition
2. **Verification System** - Local database cross-referencing for accuracy
3. **Nutritional Analysis** - Truthful 3-tier pipeline: ETL warehouse → USDA FoodData Central → honest null
4. **Environmental Context** - 7 research modules providing atmospheric, ecological, and climate data
5. **User Personalization** - Authentication, history tracking, and favorites
6. **XAI Bento HUD** - Sci-fi dark panel: SVG radial arc gauge, SHAP/LIME bars, CRT overlay, neon `#CCFF00` accents
7. **Multi-Candidate Selector** - Compare all AI-returned candidates with per-plant confidence
8. **Feedback Loop** - User corrections to improve AI accuracy
9. **Educational Enrichment** - Wikipedia summaries, botanical data, and video tutorials

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  (React Components + Framer Motion + Tailwind CSS)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
│  • AuthContext (Firebase Auth)                                 │
│  • React Hooks (useState, useEffect, useCallback)              │
│  • LocalStorage Caching                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Plant Identification Services:                                │
│  • plantDexService.js - Main identification orchestrator       │
│  • plantVerificationService.js - Local DB verification         │
│  • aiNutritionLookup.js - Nutritional data enrichment         │
├─────────────────────────────────────────────────────────────────┤
│  Environmental Research Services:                              │
│  • geolocationService.js - User location detection            │
│  • environmentalResearchService.js - 7 API integrations       │
├─────────────────────────────────────────────────────────────────┤
│  Enrichment Services:                                          │
│  • trefleService.js - Botanical database                      │
│  • wikipediaService.js - Educational content                  │
│  • videoRecommendationService.js - YouTube videos             │
│  • unsplashService.js - Dynamic backgrounds                   │
├─────────────────────────────────────────────────────────────────┤
│  User Data Services:                                           │
│  • userDataService.js - Firestore CRUD operations             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIS                              │
├─────────────────────────────────────────────────────────────────┤
│  AI & Identification:                                          │
│  • Google Gemini 3 Flash API                                   │
├─────────────────────────────────────────────────────────────────┤
│  Environmental Research (7 Modules):                           │
│  • OpenAQ (Air Quality)                                        │
│  • Global Forest Watch (Deforestation)                         │
│  • World Bank Climate (Climate Trends)                         │
│  • NASA POWER (Satellite Data)                                 │
│  • Carbon Intensity (Carbon Footprint)                         │
│  • Open Meteo (Weather History)                                │
│  • GBIF (Biodiversity)                                         │
├─────────────────────────────────────────────────────────────────┤
│  Enrichment:                                                   │
│  • Trefle API (Botanical Data)                                 │
│  • Wikipedia API (Educational Content)                         │
│  • Unsplash API (Background Images)                            │
├─────────────────────────────────────────────────────────────────┤
│  Backend Services:                                             │
│  • Firebase Authentication                                     │
│  • Firebase Firestore                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Plant Identification Module
**File**: `src/services/plantdexservice.js`

**Workflow**:
1. User uploads plant image
2. Image compressed to base64
3. Sent to Gemini 3 Flash with structured schema
4. AI returns: scientific name, common name, confidence score, visual features
5. Cross-referenced with local verified plant database
6. Enriched with nutritional data (if edible)
7. Parallel fetching of Trefle, Wikipedia, and YouTube data

**Key Features**:
- Structured JSON response schema
- Confidence scoring (0-100%)
- Visual feature extraction for XAI
- Verification status tracking
- History saving to localStorage
- `nutritionVerified` + `nutritionSource` propagated to plant object for UI provenance badges

### 1a. Truthful Nutrition Pipeline (Phase 1)
**Files**: `src/services/etlNutritionService.js`, `src/services/ainutritionlookup.js`

**3-Tier Lookup**:
```
Tier 1 — ETL Data Warehouse
  28 species with USDA/botanical reference values
  5-tier name matching: exact sci name → genus → common alias → substring

Tier 2 — USDA FoodData Central API
  Free DEMO_KEY built-in; optional VITE_USDA_API_KEY for production quota
  24-hour localStorage cache with TTL

Tier 3 — Honest null
  Returns null — no AI fabrication, no placeholder filler
  UI shows "Verified nutrition data unavailable"
```

**Forbidden**: AI-generated nutrition values (removed Phase 1 to prevent hallucination)

### 1b. XAI Bento HUD (Phase 2)
**File**: `src/components/ResultsDisplay.jsx` (XAI section)

**Components**:
- **CRT scan-line overlay**: `repeating-linear-gradient` with `rgba(204,255,0,0.012)` lines
- **Terminal boot header**: blinking `#CCFF00` status dot + `XAI_ENGINE · v3.0 · ONLINE`
- **SVG radial arc gauge**: animated `strokeDashoffset` drawing to confidence %
- **12-col bento grid**: 7-col confidence hero + 3-row stat tiles (Latency / Source / Model)
- **SHAP/LIME bars**: staggered entry, glow blur on primary, `★ PRIMARY` tag
- **Save Soil footer**: `SAVE_SOIL · XAI v3.0` brand mark

### 2. Verification System
**File**: `src/services/plantVerificationService.js`

**Database**: `src/data/verifiedPlants.json`

**Process**:
1. Fuzzy matching on scientific and common names
2. Assigns verification levels:
   - `verified` - Exact match in database
   - `cache_verified` - Previously verified identification
   - `partial_match` - Similar name found
   - `unverified` - No match, AI only

**Benefits**:
- Reduces AI hallucination
- Provides ground truth data
- Improves accuracy over time

### 3. Environmental Research Module
**File**: `src/services/environmentalResearchService.js`

**7 Research APIs**:

#### 3.1 OpenAQ - Atmospheric Impact
- **Data**: PM2.5, NO2, O3, CO2 levels
- **Endpoint**: `https://api.openaq.org/v2/latest`
- **Radius**: 50km from user location
- **Update**: Real-time

#### 3.2 Global Forest Watch - Deforestation
- **Data**: Tree cover loss (hectares)
- **Endpoint**: `https://data-api.globalforestwatch.org`
- **Period**: 2015-2023
- **Classification**: High/Moderate/Low impact

#### 3.3 World Bank Climate - Climate Resilience
- **Data**: Temperature projections, precipitation trends
- **Source**: World Bank Climate Portal
- **Scope**: Regional climate models

#### 3.4 NASA POWER - Satellite Insights
- **Data**: Precipitation (PRECTOTCORR), Temperature (T2M)
- **Endpoint**: `https://power.larc.nasa.gov/api`
- **Resolution**: 0.5° x 0.5° grid
- **Use Case**: Agricultural monitoring

#### 3.5 Carbon Intensity - Eco-Awareness
- **Data**: Electricity carbon footprint (gCO2/kWh)
- **Endpoint**: `https://api.carbonintensity.org.uk`
- **Coverage**: UK real-time + global estimates
- **Index**: Low/Moderate/High

#### 3.6 Open Meteo - Weather History
- **Data**: Current vs. 30-day historical comparison
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Metrics**: Temperature, precipitation, wind speed
- **Trend**: Warming/cooling detection

#### 3.7 GBIF - Biodiversity Metrics
- **Data**: Species occurrence records
- **Endpoint**: `https://api.gbif.org/v1/occurrence`
- **Radius**: 50km from location
- **Classification**: High/Moderate/Low richness

**Caching Strategy**:
- 24-hour TTL for all research data
- Coordinate-based cache keys (rounded to 2 decimals)
- localStorage implementation

### 4. Authentication & User Data
**Files**: 
- `src/contexts/AuthContext.jsx`
- `src/services/userDataService.js`
- `src/config/firebase.js`

**Firebase Collections**:
```
users/
  {userId}/
    - favoritePlants: Array
    - favoriteRecipes: Array
    - createdAt: Timestamp
    
    history/
      {historyId}/
        - scientificName: String
        - commonName: String
        - image: String (base64)
        - confidence: Number
        - timestamp: Timestamp
        - feedback: Object

feedback/
  {feedbackId}/
    - userId: String
    - identificationId: String
    - feedbackType: 'confirm' | 'correct'
    - correctName: String
    - timestamp: Timestamp
```

**Security Rules** (Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
    }
  }
}
```

---

## Environmental Research APIs

### API Integration Summary

| API | Purpose | Free Tier | Key Required | Update Frequency |
|-----|---------|-----------|--------------|------------------|
| OpenAQ | Air Quality | Unlimited | No | Real-time |
| Global Forest Watch | Deforestation | Unlimited | No | Annual |
| World Bank Climate | Climate Trends | Unlimited | No | Quarterly |
| NASA POWER | Satellite Data | Unlimited | No | Daily |
| Carbon Intensity | Carbon Footprint | Unlimited | No | 30-min |
| Open Meteo | Weather History | 10k/day | No | Hourly |
| GBIF | Biodiversity | Unlimited | No | Weekly |

### Geolocation Service
**File**: `src/services/geolocationService.js`

**Features**:
- Browser Geolocation API
- 1-hour cache TTL
- Fallback to New Delhi (28.6139, 77.2090)
- Reverse geocoding via OpenStreetMap Nominatim
- Permission handling

---

## Firebase Integration

### Authentication Flow
```
User Registration:
1. User enters email, password, display name
2. Firebase createUserWithEmailAndPassword()
3. Update profile with display name
4. Auto-login and redirect to dashboard

User Login:
1. User enters email, password
2. Firebase signInWithEmailAndPassword()
3. onAuthStateChanged listener updates context
4. Persistent session across page reloads

User Logout:
1. Firebase signOut()
2. Clear auth context
3. Redirect to home page
```

### Firestore Operations
- **Create**: `setDoc()` for new documents
- **Read**: `getDoc()`, `getDocs()` with queries
- **Update**: `updateDoc()`, `arrayUnion()`, `arrayRemove()`
- **Delete**: `deleteDoc()`

**Indexing**:
- Timestamp descending for history queries
- User ID for security rules

---

## Data Flow

### Plant Identification Flow
```
1. User uploads image
   ↓
2. Image compressed (imageHelper.js)
   ↓
3. Sent to Gemini 3 Flash API
   ↓
4. AI returns structured JSON
   ↓
5. Verification against local DB
   ↓
6. Parallel enrichment fetching:
   - Trefle (botanical data)
   - Wikipedia (educational summary)
   - YouTube (recipe/care videos)
   - Nutrition (if edible)
   ↓
7. XAI metadata generation:
   - Confidence score
   - Inference latency
   - Feature importance (SHAP/LIME-inspired)
   ↓
8. Save to user history (if logged in)
   ↓
9. Display results with research data
```

### Environmental Research Flow
```
1. Component mounts (ResearchDataCards)
   ↓
2. Request user location (geolocationService)
   ↓
3. Reverse geocode to location name
   ↓
4. Fetch all 7 research APIs in parallel (Promise.allSettled)
   ↓
5. Cache results (24-hour TTL)
   ↓
6. Display data cards with loading shimmers
   ↓
7. Graceful fallback for unavailable data
```

### User Feedback Flow
```
1. User views identification result
   ↓
2. Clicks "Correct" or "Incorrect"
   ↓
3. If incorrect, opens correction form
   ↓
4. User submits correct plant name + comments
   ↓
5. Saved to Firestore /feedback collection
   ↓
6. Updates history entry with feedback status
   ↓
7. Data used for future AI improvements
```

---

## Security & Performance

### Security Measures
1. **Environment Variables**: All API keys in `.env` (not committed)
2. **Firebase Rules**: User-specific read/write permissions
3. **Input Validation**: Image size limits, file type checking
4. **XSS Prevention**: React's built-in escaping
5. **HTTPS Only**: All API calls over secure connections

### Performance Optimizations
1. **Caching**:
   - Geolocation: 1 hour
   - Research data: 24 hours
   - Trefle/Wikipedia: 7 days
   - Unsplash backgrounds: 1 hour rotation

2. **Code Splitting**: Vite's automatic chunking

3. **Image Optimization**: 
   - Compression before upload
   - Base64 encoding for storage

4. **Parallel API Calls**: 
   - Promise.all for enrichment
   - Promise.allSettled for research data

5. **Loading States** (Phase 3):
   - 3-milestone inference messages: Extracting → Verifying → Enriching
   - `AnimatePresence` crossfade between milestone messages
   - Animated progress dots (active dot pulses, completed dots filled)
   - Timed at +2.8 s / +5.2 s from identification start

### Bundle Size (Post Phase 5)
- **Total**: ~644 KB (178 KB gzipped)
- **CSS**: ~45 KB (9.3 KB gzipped)
- **HTML**: ~1.6 KB (0.75 KB gzipped)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Deployment

### Vercel Configuration
**File**: `vercel.json`
```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Process
```bash
npm run build
```

**Output**:
- `dist/index.html` - Entry point
- `dist/assets/` - Bundled JS and CSS
- Optimized for production
- Tree-shaking enabled
- Minification applied

### Environment Variables Required
See `.env.example` for complete list:
- `VITE_GEMINI_API_KEY` (Required)
- `VITE_FIREBASE_*` (Required for auth)
- `VITE_TREFLE_API_KEY` (Optional)
- `VITE_UNSPLASH_ACCESS_KEY` (Optional)

---

## Testing

### Test Coverage
- **Unit Tests**: 15 tests across 3 test suites
- **Coverage**: Geolocation, Auth Context, Environmental APIs
- **Framework**: Jest + React Testing Library

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Completed Enhancements (Phases 1–5)

| Phase | Deliverable | Key Files |
|-------|-------------|-----------|
| Phase 1 | Truthful nutrition pipeline (ETL → USDA → null) | `etlNutritionService.js`, `ainutritionlookup.js` |
| Phase 1 | Env wiring fix (`VITE_GEMINI_API_KEY` → `process.env.API_KEY`) | `vite.config.js` |
| Phase 2 | Sci-fi XAI bento HUD with SVG arc gauge + SHAP bars | `ResultsDisplay.jsx` |
| Phase 2 | Milestone loading Spinner with `AnimatePresence` | `Spinner.jsx`, `App.jsx` |
| Phase 3 | Background overlay 85%→60%, golden watermarks | `SoilBackground.jsx` |
| Phase 3 | Fixed unclosed CSS rule + missing `@keyframes scan-line` | `index.css` |
| Phase 3 | Removed Stage 1/2 fallback text from button | `ImageUploader.jsx` |
| Phase 4 | Multi-candidate pill selector | `ResultsDisplay.jsx` |
| Phase 4 | Scan Again CTA action bar (`onNewScan` prop) | `ResultsDisplay.jsx`, `App.jsx` |
| Phase 4 | Dynamic geographic/conservation text from plant data | `ResultsDisplay.jsx` |
| Phase 4 | Visual bridge gradient between green card and dark HUD | `ResultsDisplay.jsx` |
| Phase 5 | Rotating canvas globe with lat/lon grid + GPS pin | `GlobeEnvironmental.jsx` |
| Phase 5 | 7 environmental metric chips (Air, Forest, Temp, Carbon, Bio, Precip, Satellite) | `GlobeEnvironmental.jsx` |
| Phase 5 | `ResearchDataCards` wired into App below results/history | `App.jsx` |
| Phase 6 | README phase log, feature list, env var table updated | `README.md` |
| Phase 6 | SYSTEM_ARCHITECTURE completed table, key features, nutrition/XAI docs | `SYSTEM_ARCHITECTURE.md` |

## Future Enhancements

1. **Mobile App**: React Native version
2. **Offline Mode**: Service workers for PWA
3. **AR Integration**: Camera overlay for real-time identification
4. **Community Features**: User-submitted plant photos
5. **Advanced Analytics**: ML-based trend analysis
6. **Multi-language**: i18n support
7. **Export Reports**: PDF generation for research data

---

## License & Credits

**Project**: PlantDexPro - MCA Research Project  
**Theme**: Save Soil Initiative  
**APIs**: OpenAQ, GFW, World Bank, NASA, Carbon Intensity, Open Meteo, GBIF  
**AI**: Google Gemini 3 Flash  
**Backend**: Firebase (Google Cloud)  

---

*Last Updated: March 2026 — Phases 1–5 Complete · All Master Plan Phases Delivered*
