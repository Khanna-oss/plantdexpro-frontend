import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantDexService.js';
import { compressImage } from './utils/imageHelper.js';
import { motion } from 'framer-motion';
import { XCircle, History } from 'lucide-react';

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

      // Compress image to ensure upload success
      const base64Image = await compressImage(file);
      
      const data = await plantDexService.identifyPlant(base64Image);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.plants || data.plants.length === 0) {
        throw new Error("No plants identified. Try a closer shot.");
      }

      setResults(data.plants);
      setHistory(plantDexService.getHistory());

    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to process image.");
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
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-6">
            PlantDexPro
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto">
            Identify plants instantly. Unlock recipes, safety tips, and care guides with AI.
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative z-10 mb-16">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-xl shadow-sm flex items-center justify-center gap-3" 
            role="alert"
          >
            <XCircle className="w-6 h-6 shrink-0" />
            <span className="font-medium italic">"{error}"</span>
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="w-full animate-fade-in-up">
            <ResultsDisplay results={results} imagePreview={imagePreview} />
          </div>
        )}

        {!isLoading && results.length === 0 && history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-12 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-xs font-bold tracking-widest">
               <History size={14} /> Recent Discoveries
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {history.map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                      <div className="h-32 bg-gray-200 relative overflow-hidden">
                         {item.image && (
                           <img 
                             src={item.image} 
                             className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                             alt={item.name} 
                           />
                         )}
                      </div>
                      <div className="p-3">
                         <p className="font-bold text-sm truncate text-gray-800 dark:text-gray-200">{item.name}</p>
                         <p className="text-[10px] text-gray-500">{item.date}</p>
                      </div>
                  </div>
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
