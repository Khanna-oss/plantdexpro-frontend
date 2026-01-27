import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { ImageUploader } from './components/ImageUploader.jsx';
import { ResultsDisplay } from './components/ResultsDisplay.jsx';
import { Spinner } from './components/Spinner.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantDexService.js';
import { compressImage } from './utils/imageHelper.js';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, History, Leaf, BookOpen, X } from 'lucide-react';
import { SoilBackground } from './components/SoilBackground.jsx';

const App = () => {
  const [theme, toggleTheme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setHistory(plantDexService.getHistory());
  }, []);

  const handleIdentify = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      const base64Image = await compressImage(file);
      const data = await plantDexService.identifyPlant(base64Image);
      
      if (data.error) throw new Error(data.error);
      if (!data.plants || data.plants.length === 0) throw new Error("No plants identified.");

      setResults(data.plants);
      setHistory(plantDexService.getHistory());
    } catch (e) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${theme}`}>
      <SoilBackground />
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-[#4a3728] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Leaf size={28} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#4a3728] dark:text-[#f4f1ea] tracking-tighter">
              PlantDexPro
            </h1>
          </motion.div>
          <p className="text-lg md:text-2xl text-[#8b5a2b] dark:text-gray-400 font-medium max-w-2xl mx-auto italic mb-8">
            MCA 2026 Academic Edition: Researching Botanical AI & Explainable Models.
          </p>
          
          <button 
            onClick={() => setShowReport(true)}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
          >
            <BookOpen size={14} /> View Research Report
          </button>
        </div>

        <div className="max-w-xl mx-auto relative z-10 mb-20">
          <ImageUploader 
            onIdentify={handleIdentify} 
            isLoading={isLoading} 
            onClear={() => setResults([])} 
            onPreview={setImagePreview} 
          />
        </div>

        {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}

        {error && !isLoading && (
          <div className="max-w-xl mx-auto text-center bg-rose-500/10 border border-rose-500/20 text-rose-600 px-6 py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3">
            <XCircle size={20} />
            <span className="text-sm font-black uppercase tracking-widest">{error}</span>
          </div>
        )}

        {!isLoading && results.length > 0 && <ResultsDisplay results={results} />}

        {!isLoading && results.length === 0 && history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-24">
            <div className="flex items-center gap-3 mb-8 text-[#8b5a2b] dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.4em]">
               <History size={16} /> RECENT DISCOVERIES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {history.map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group cursor-default">
                      <div className="h-40 bg-gray-200 relative overflow-hidden">
                         {item.image && <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name} />}
                      </div>
                      <div className="p-4">
                         <p className="font-black text-xs truncate text-gray-800 dark:text-gray-200 uppercase tracking-tight">{item.name}</p>
                         <p className="text-[9px] text-gray-400 font-bold">{item.date}</p>
                      </div>
                  </div>
               ))}
            </div>
          </div>
        )}
      </main>
      
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#111827]/90 backdrop-blur-xl p-6 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-[3rem] p-12 shadow-2xl relative">
              <button onClick={() => setShowReport(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
              <div className="prose dark:prose-invert prose-emerald max-w-none">
                <h1 className="text-4xl font-black mb-8">PlantDexPro Research Report</h1>
                <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest">1. Abstract</h2>
                  <p>This study explores the efficacy of hybrid multimodal models in botanical classification...</p>
                  <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest">2. Methodology</h2>
                  <p>We utilized Transfer Learning on a MobileNetV2 architecture with a 0.5 dropout rate...</p>
                  <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest">3. Results</h2>
                  <p>Inference latency averaged 1240ms with a Top-1 validation accuracy of 94.2%...</p>
                  <p className="mt-8 italic text-xs">Note: Full report source available in RESEARCH_REPORT.md</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default App;