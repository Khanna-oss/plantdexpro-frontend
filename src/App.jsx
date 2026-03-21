import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { ImageUploader } from './components/ImageUploader.jsx';
import { ResultsDisplay } from './components/ResultsDisplay.jsx';
import { Spinner } from './components/Spinner.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantdexservice.js';
import { compressImage } from './utils/imageHelper.js';
import { motion } from 'framer-motion';
import { XCircle, History, Leaf } from 'lucide-react';
import { SoilBackground } from './components/SoilBackground.jsx';

const INFERENCE_STAGE_ONE = 'Stage 1: Feature Extraction & Scalar Value Mapping...';
const INFERENCE_STAGE_TWO = 'Stage 2: Reconciling Stacking Ensembles (CatBoost + KNN)...';
const INFERENCE_STAGE_THREE = 'Stage 3: Locking final values and rendering the XAI Bento Grid...';

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
    setInferenceMessage(INFERENCE_STAGE_ONE);

    const stageTwoTimer = window.setTimeout(() => {
      setInferenceMessage(INFERENCE_STAGE_TWO);
    }, 1500);

    window.__plantDexInferenceTimers = [stageTwoTimer];

    try {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      const base64Image = await compressImage(file);
      const data = await plantDexService.identifyPlant(base64Image);
      
      if (data.error) throw new Error(data.error);
      
      if (!data.plants || data.plants.length === 0) {
        throw new Error("No plants identified. Try a clearer image.");
      }

      setInferenceMessage(INFERENCE_STAGE_THREE);
      await new Promise(resolve => window.setTimeout(resolve, 300));
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

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-500 ${theme}`}>
      <SoilBackground />
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 glass-panel flex items-center justify-center text-[var(--cream)] shadow-xl">
              <Leaf size={28} />
            </div>
            <h1 className="font-heading text-5xl md:text-7xl text-[var(--cream)] tracking-tight leading-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              PlantDexPro
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-body-muted font-medium max-w-2xl mx-auto"
          >
            Identify plants instantly. Unlock botanical insights, safety records, and habitat data with AI.
          </motion.p>
        </div>

        <div className="max-w-xl mx-auto relative z-10 mb-20">
          <ImageUploader 
            onIdentify={handleIdentify} 
            isLoading={isLoading} 
            loadingMessage={inferenceMessage}
            onClear={handleClear} 
            onPreview={setImagePreview} 
          />
        </div>

        {isLoading && (
           <div className="flex justify-center py-12">
             <Spinner message={inferenceMessage} />
           </div>
        )}

        {error && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center glass-panel text-rose-200 px-6 py-4 flex items-center justify-center gap-3" 
            role="alert"
          >
            <XCircle className="w-6 h-6 shrink-0" />
            <span className="text-sm font-black uppercase tracking-widest">{error}</span>
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="w-full">
            <ResultsDisplay results={results} imagePreview={imagePreview} />
          </div>
        )}

        {!isLoading && results.length === 0 && history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-24">
            <div className="flex items-center gap-3 mb-8 text-[var(--golden-soil)] uppercase text-[10px] font-black tracking-[0.4em]">
               <History size={16} /> Recent Discoveries
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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

      </main>
      <Footer />
    </div>
  );
};

export default App;