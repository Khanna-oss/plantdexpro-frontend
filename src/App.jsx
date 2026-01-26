import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { ImageUploader } from './components/ImageUploader.jsx';
import { ResultsDisplay } from './components/ResultsDisplay.jsx';
import { Spinner } from './components/Spinner.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantDexService.js';
import { compressImage } from './utils/imageHelper.js';
import { motion } from 'framer-motion';
import { XCircle, History, Leaf } from 'lucide-react';
import { SoilBackground } from './components/SoilBackground.jsx';

const App = () => {
  const [theme, toggleTheme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [history, setHistory] = useState([]);

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
      
      if (!data.plants || data.plants.length === 0) {
        throw new Error("No plants identified. Try a clearer image.");
      }

      setResults(data.plants);
      setHistory(plantDexService.getHistory());

    } catch (e) {
      console.error(e);
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setResults([]);
    setError(null);
    setImagePreview(null);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${theme}`}>
      <SoilBackground />
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
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
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-[#8b5a2b] dark:text-gray-400 font-medium max-w-2xl mx-auto italic"
          >
            Identify plants instantly. Unlock botanical insights, safety records, and habitat data with AI.
          </motion.p>
        </div>

        <div className="max-w-xl mx-auto relative z-10 mb-20">
          <ImageUploader 
            onIdentify={handleIdentify} 
            isLoading={isLoading} 
            onClear={handleClear} 
            onPreview={setImagePreview} 
          />
        </div>

        {isLoading && (
           <div className="flex justify-center py-12">
             <Spinner />
           </div>
        )}

        {error && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center bg-rose-500/10 border border-rose-500/20 text-rose-600 px-6 py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3" 
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
            <div className="flex items-center gap-3 mb-8 text-[#8b5a2b] dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.4em]">
               <History size={16} /> Recent Discoveries
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {history.map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group cursor-default"
                  >
                      <div className="h-40 bg-gray-200 relative overflow-hidden">
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
                         <p className="font-black text-xs truncate text-gray-800 dark:text-gray-200 uppercase tracking-tight">{item.name}</p>
                         <p className="text-[9px] text-gray-400 font-bold">{item.date}</p>
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