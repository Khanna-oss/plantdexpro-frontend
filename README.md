# 🌱 PlantDexPro

**AI-Powered Plant Identification & Environmental Research Platform**

A comprehensive MCA research project integrating plant identification AI with real-time environmental data to promote the **Save Soil Initiative**.

[![Built with React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%203%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✅ Development Phase Log

| Phase | Description | Status | Commit |
|-------|-------------|--------|--------|
| **Phase 1** | Truthful nutrition pipeline, env wiring fix, mobile API key fix | ✅ Complete | `1d8edab` |
| **Phase 2** | Sci-fi XAI bento HUD — SVG arc gauge, SHAP bars, CRT overlay | ✅ Complete | `d818f88` |
| **Phase 3** | Clean loading state, background visibility, `@keyframes` CSS fix | ✅ Complete | `0be852d` |
| **Phase 4** | Multi-candidate selector, Scan Again CTA, dynamic geo/conservation text | ✅ Complete | `afaafd2` |
| **Phase 5** | Optional 3D globe environmental layer | ⏳ Optional | — |
| **Phase 6** | Documentation and submission pack | 🔄 In progress | — |

---

## ✨ Features

### 🔬 Core Functionality
- **AI Plant Identification**: Gemini 3 Flash model for accurate species recognition
- **Verification System**: Cross-reference with local botanical database
- **XAI Transparency**: SHAP/LIME-inspired feature importance explanations
- **Confidence Scoring**: Visual confidence levels with color-coded indicators

### 🌍 Environmental Research (7 Modules)
1. **Atmospheric Impact** - Real-time air quality (PM2.5, NO2, O3)
2. **Deforestation Context** - Regional forest cover loss data
3. **Climate Resilience** - Temperature and precipitation trends
4. **Satellite Insights** - NASA vegetation and climate parameters
5. **Eco-Awareness** - Electricity carbon intensity metrics
6. **Weather History** - Historical vs. current weather patterns
7. **Biodiversity Metrics** - Species richness and occurrence data

### 👤 User Features
- **Authentication**: Firebase email/password login and registration
- **Plant History**: Track all past identifications
- **Favorites**: Save favorite plants and recipes
- **Feedback Loop**: Confirm or correct AI identifications
- **Personalized Dashboard**: View history, favorites, and profile

### 📚 Educational Content
- **Botanical Data**: Trefle API integration for taxonomy and growth info
- **Wikipedia Summaries**: Educational plant information
- **Video Tutorials**: YouTube recipe and care videos
- **Nutritional Analysis**: Truthful 3-tier pipeline — ETL data warehouse → USDA FoodData Central API → honest null (no AI fabrication)

### 🎨 UI/UX
- **Save Soil Theme**: Earth-tone color palette (maroon, coffee, soil) with `rgba(199,144,22)` golden accents
- **Dynamic Backgrounds**: Unsplash nature photography at 60% overlay for visibility
- **SAVE OUR SOIL Watermarks**: Golden-tone diagonal background marks
- **Glassmorphism**: Biomorphic translucent card designs (`soil-shell`, `glass-panel`)
- **XAI Bento HUD**: Sci-fi dark panel with CRT scan-line overlay, SVG radial arc gauge, animated SHAP/LIME bars, neon-green `#CCFF00` accents
- **Milestone Loading**: 3-step inference progress with crossfade messages and animated dots
- **Multi-Candidate Selector**: Compare all AI-returned plant candidates in a pill tab row
- **Animations**: Framer Motion smooth transitions with `AnimatePresence`
- **Responsive**: Mobile-first design with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - UI library
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion 11.0** - Animation library
- **Lucide React** - Icon library

### AI & APIs
- **Google Gemini 3 Flash** - Plant identification AI
- **OpenAQ** - Air quality data
- **Global Forest Watch** - Deforestation data
- **NASA POWER** - Satellite climate data
- **Open Meteo** - Weather history
- **GBIF** - Biodiversity data
- **Trefle** - Botanical database
- **Wikipedia** - Educational content
- **Unsplash** - Background images

### Backend
- **Firebase Authentication** - User auth
- **Firebase Firestore** - NoSQL database

### Testing
- **Jest 30.3** - Testing framework
- **React Testing Library 16.3** - Component testing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

You'll also need API keys for:
- **Google Gemini API** (Required) - [Get key](https://ai.google.dev/)
- **Firebase Project** (Required) - [Create project](https://console.firebase.google.com/)
- **Trefle API** (Optional) - [Get key](https://trefle.io/)
- **Unsplash API** (Optional) - [Get key](https://unsplash.com/developers)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/plantdexpro-frontend.git
cd plantdexpro-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys (see [Environment Variables](#-environment-variables) section).

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication
3. Create a **Firestore database**
4. Copy your Firebase config to `.env`
5. Set up Firestore security rules:

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

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# ========================================
# REQUIRED - Gemini AI
# ========================================
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ========================================
# REQUIRED - Firebase Configuration
# ========================================
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ========================================
# OPTIONAL - Backend API
# ========================================
VITE_BACKEND_URL=http://localhost:5000

# ========================================
# OPTIONAL - Botanical Enrichment
# ========================================
# Free tier: 120 requests/day
# Get your key from: https://trefle.io/
VITE_TREFLE_API_KEY=your_trefle_api_key_here

# ========================================
# OPTIONAL - Dynamic Backgrounds
# ========================================
# Free tier: 50 requests/hour
# Get your key from: https://unsplash.com/developers
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### API Key Sources

| Service | Required | Free Tier | Get Key |
|---------|----------|-----------|---------|
| Google Gemini | ✅ Yes | Yes | [ai.google.dev](https://ai.google.dev/) |
| Firebase | ✅ Yes | Yes | [console.firebase.google.com](https://console.firebase.google.com/) |
| Trefle | ❌ No | 120/day | [trefle.io](https://trefle.io/) |
| Unsplash | ❌ No | 50/hour | [unsplash.com/developers](https://unsplash.com/developers) |
| USDA FoodData | ❌ No | `DEMO_KEY` built-in | [fdc.nal.usda.gov](https://fdc.nal.usda.gov/api-guide.html) |

**Note**: The 7 environmental research APIs (OpenAQ, GFW, NASA, etc.) are **free and require no API keys**.

> ⚠️ **Vercel Deployment**: All `VITE_` prefixed variables **must** be set in the Vercel dashboard under Project Settings → Environment Variables. Variables in `.env` files are NOT read by Vercel at build time.

---

## 💻 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Watch Mode

Run tests in watch mode for development:

```bash
npm run test:watch
```

### Coverage Report

Generate test coverage report:

```bash
npm run test:coverage
```

### Test Suites

- **Geolocation Service** - Location detection and caching
- **Auth Context** - Firebase authentication flow
- **Environmental Research** - API integration and data fetching

---

## 📁 Project Structure

```
plantdexpro-frontend/
├── public/                      # Static assets
├── src/
│   ├── components/              # React components
│   │   ├── AuthModal.jsx        # Login/Register modal
│   │   ├── FeedbackButtons.jsx  # AI feedback system
│   │   ├── Header.jsx           # App header with auth
│   │   ├── Footer.jsx           # App footer
│   │   ├── ImageUploader.jsx    # Image upload component
│   │   ├── ResultsDisplay.jsx   # Plant identification results
│   │   ├── ResearchDataCards.jsx # Environmental research UI
│   │   ├── UserDashboard.jsx    # User profile and history
│   │   ├── SoilBackground.jsx   # Dynamic background
│   │   └── ...
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── data/
│   │   └── verifiedPlants.json  # Local plant database
│   ├── hooks/
│   │   └── useDarkMode.js       # Theme hook
│   ├── services/
│   │   ├── plantdexservice.js   # Main plant ID service
│   │   ├── plantVerificationService.js
│   │   ├── environmentalResearchService.js
│   │   ├── geolocationService.js
│   │   ├── userDataService.js
│   │   ├── trefleService.js
│   │   ├── wikipediaService.js
│   │   ├── unsplashService.js
│   │   └── ...
│   ├── utils/
│   │   └── imageHelper.js       # Image compression
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── __mocks__/                   # Jest mocks
├── __tests__/                   # Test files
├── .env.example                 # Environment template
├── vercel.json                  # Vercel config
├── jest.config.cjs              # Jest configuration
├── babel.config.cjs             # Babel configuration
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies
├── README.md                    # This file
└── SYSTEM_ARCHITECTURE.md       # Technical documentation
```

---

## 📡 API Documentation

### Plant Identification Flow

```javascript
// 1. Upload image
const file = event.target.files[0];

// 2. Compress image
const base64Image = await compressImage(file);

// 3. Identify plant
const data = await plantDexService.identifyPlant(base64Image);

// 4. Result structure
{
  plants: [{
    scientificName: "Aloe vera",
    commonName: "Aloe Vera",
    confidenceScore: 94,
    isEdible: true,
    description: "...",
    visualFeatures: [...],
    xaiMeta: {
      confidence: 94,
      inferenceLatencyMs: 1280,
      featureImportance: [...]
    },
    trefleEnrichment: {...},
    wikipediaEnrichment: {...},
    recipeVideos: [...]
  }]
}
```

### Environmental Research

```javascript
// Get user location
const location = await geolocationService.getUserLocation();

// Fetch all research data
const research = await environmentalResearchService.getAllResearchData(
  location.latitude,
  location.longitude
);

// Result structure
{
  airQuality: { pm25: {...}, no2: {...}, available: true },
  deforestation: { totalLoss: 1250, severity: 'moderate', ... },
  climate: { temperatureTrend: {...}, ... },
  satellite: { precipitation: 'Available', ... },
  carbon: { intensity: 475, unit: 'gCO2/kWh', ... },
  weather: { current: {...}, historical30Days: {...}, ... },
  biodiversity: { speciesCount: 1250, richness: 'high', ... }
}
```

### User Authentication

```javascript
// Register
const user = await register(email, password, displayName);

// Login
const user = await login(email, password);

// Logout
await logout();

// Save to history
await userDataService.savePlantToHistory(userId, plantData);

// Add to favorites
await userDataService.addToFavorites(userId, plantData);

// Submit feedback
await userDataService.submitFeedback(userId, identificationId, {
  type: 'confirm', // or 'correct'
  correctName: 'Actual Plant Name',
  comments: 'Additional notes'
});
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider

3. Ensure SPA routing is configured (see `vercel.json`)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use ESLint for linting
- Follow React best practices
- Write tests for new features
- Maintain the Save Soil theme aesthetic

---

## 📄 License

This project is part of an MCA research initiative for the **Save Soil Movement**.

---

## 🙏 Acknowledgments

- **Save Soil Initiative** - Project theme and inspiration
- **Google Gemini** - AI plant identification
- **Firebase** - Authentication and database
- **OpenAQ, GFW, NASA, GBIF** - Environmental data providers
- **Trefle & Wikipedia** - Botanical and educational content
- **Unsplash** - Nature photography

---

## 📞 Support

For issues, questions, or suggestions:

- 📧 Email: support@plantdexpro.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/plantdexpro-frontend/issues)
- 📖 Docs: [System Architecture](./SYSTEM_ARCHITECTURE.md)

---

## 🌟 Features Roadmap

- [x] Truthful ETL-verified nutrition pipeline (Phase 1)
- [x] Sci-fi XAI bento HUD with SVG arc confidence gauge (Phase 2)
- [x] Clean milestone-based loading states (Phase 3)
- [x] Multi-candidate result selector (Phase 4)
- [ ] 3D globe environmental layer (Phase 5)
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] AR plant identification
- [ ] Community plant submissions
- [ ] Multi-language support
- [ ] PDF report generation

---

**Built with 💚 for the Save Soil Initiative**

*Empowering botanical research through AI and environmental awareness*
