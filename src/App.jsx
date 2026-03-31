import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { ImageUploader } from './components/ImageUploader.jsx';
import { ResultsDisplay } from './components/ResultsDisplay.jsx';
import { Spinner } from './components/Spinner.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantdexservice.js';
import { motion } from 'framer-motion';
import { XCircle, History, Leaf } from 'lucide-react';
import { SoilBackground } from './components/SoilBackground.jsx';
import { GlobeEnvironmental } from './components/GlobeEnvironmental.jsx';
import { ResearchDataCards } from './components/ResearchDataCards.jsx';

const MILESTONE_1 = 'Extracting botanical features...';
const MILESTONE_2 = 'Verifying species profile...';
const MILESTONE_3 = 'Enriching with research data...';

const App = () => {
  const [theme, toggleTheme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [inferenceMessage, setInferenceMessage] = useState('');

  const clearInferenceTimers = useCallback(() => {
    if (window.__plantDexInferenceTimers) {
      window.__plantDexInferenceTimers.forEach(clearTimeout);
    }
    window.__plantDexInferenceTimers = [];
  }, []);

  useEffect(() => {
    setHistory(plantDexService.getHistory());

    return () => {
      clearInferenceTimers();
    };
  }, [clearInferenceTimers]);

  const handleIdentify = useCallback(async (file) => {
    clearInferenceTimers();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setInferenceMessage(MILESTONE_1);
    const t1 = window.setTimeout(() => setInferenceMessage(MILESTONE_2), 2800);
    const t2 = window.setTimeout(() => setInferenceMessage(MILESTONE_3), 5200);
    window.__plantDexInferenceTimers = [t1, t2];

    try {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      const data = await plantDexService.identifyPlant(file);
      
      if (data.error) throw new Error(data.error);
      
      if (!data.plants || data.plants.length === 0) {
        throw new Error("No plants identified. Try a clearer image.");
      }

      await new Promise(resolve => window.setTimeout(resolve, 100));
      setResults(data.plants);
      setHistory(plantDexService.getHistory());

    } catch (e) {
      console.error(e);
      setError(e.message || "An unknown error occurred.");
    } finally {
      clearInferenceTimers();
      setInferenceMessage('');
      setIsLoading(false);
    }
  }, [clearInferenceTimers]);

  const handleClear = useCallback(() => {
    clearInferenceTimers();
    setResults([]);
    setError(null);
    setImagePreview(null);
    setInferenceMessage('');
  }, [clearInferenceTimers]);

  const identificationResult = results.find(
    (plant) => Boolean(plant?.scientificName || plant?.commonName)
  ) || null;
  const isAnalyzing = isLoading || Boolean(inferenceMessage);
  const resultReady = Boolean(identificationResult) && !error && !isAnalyzing;
  const shouldShowEnvironmentalHud =
    Boolean(identificationResult) && isAnalyzing === false && resultReady === true;

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-500 ${theme}`}>
      <SoilBackground />
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">

        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--golden-soil)]/15 border border-[var(--golden-soil)]/25 flex items-center justify-center">
              <Leaf size={24} className="text-[var(--golden-soil)]" />
            </div>
            <h1 className="font-heading text-5xl md:text-6xl text-[var(--cream)] tracking-tight leading-none">
              PlantDexPro
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-xl text-body-muted font-medium max-w-xl mx-auto leading-relaxed"
          >
            Identify plants instantly. Unlock botanical insights, safety records, and habitat data with AI-powered research tools.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--golden-soil)]/60 mt-4"
          >
            Save Soil Initiative &bull; MCA Research Project
          </motion.p>
        </div>

        {/* Upload */}
        <div className="max-w-xl mx-auto relative z-10 mb-20">
          <ImageUploader
            onIdentify={handleIdentify}
            isLoading={isLoading}
            loadingMessage={inferenceMessage}
            onClear={handleClear}
            onPreview={setImagePreview}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner message={inferenceMessage} />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto glass-panel border border-rose-400/20"
            role="alert"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-rose-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-rose-200 mb-1">Identification Failed</h3>
                <p className="text-sm text-rose-300/80">{error}</p>
              </div>
            </div>
            <div className="bg-[var(--golden-soil)]/10 rounded-xl p-4 border border-[var(--golden-soil)]/20">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--golden-soil)] mb-3">Tips for Better Results</h4>
              <ul className="space-y-2 text-xs text-[var(--cream)]/70">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--golden-soil)] mt-0.5">•</span>
                  <span><strong className="text-[var(--cream)]">Good Lighting:</strong> Take photos in natural daylight, avoid shadows and harsh direct sunlight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--golden-soil)] mt-0.5">•</span>
                  <span><strong className="text-[var(--cream)]">Clear Focus:</strong> Ensure the plant is in sharp focus, not blurry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--golden-soil)] mt-0.5">•</span>
                  <span><strong className="text-[var(--cream)]">Full View:</strong> Capture the entire leaf or flower, centered in the frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--golden-soil)] mt-0.5">•</span>
                  <span><strong className="text-[var(--cream)]">Close-Up Details:</strong> Include visible veins, edges, and texture patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--golden-soil)] mt-0.5">•</span>
                  <span><strong className="text-[var(--cream)]">Clean Background:</strong> Use a plain background to help the AI focus on the plant</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="w-full">
            <ResultsDisplay results={results} imagePreview={imagePreview} onNewScan={handleClear} />
          </div>
        )}

        {/* History */}
        {!isLoading && results.length === 0 && history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-24">
            <div className="flex items-center gap-3 mb-6 text-[var(--golden-soil)]/80 uppercase text-[9px] font-black tracking-[0.35em]">
              <History size={14} /> Recent Discoveries
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="glass-card overflow-hidden group cursor-default"
                >
                  <div className="h-40 bg-black/20 relative overflow-hidden rounded-t-[16px]">
                    {item.image && (
                      <img
                        src={item.image}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        alt={item.name}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="font-black text-xs truncate text-[var(--cream)] uppercase tracking-tight">{item.name}</p>
                    <p className="text-[9px] text-body-muted font-bold">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* === PHASE 5: Environmental Intelligence Layer === */}
        {shouldShowEnvironmentalHud && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-3xl mx-auto mt-20"
          >
            <div className="flex items-center gap-3 mb-5 text-[var(--golden-soil)]/80 uppercase text-[9px] font-black tracking-[0.35em]">
              <Leaf size={14} /> Environmental Intelligence
            </div>
            <GlobeEnvironmental plant={identificationResult} />
            <div className="mt-6">
              <ResearchDataCards />
            </div>
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;