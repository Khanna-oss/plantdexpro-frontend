import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantDexService.js';
import { motion } from 'framer-motion';
import { XCircle, History } from 'lucide-react';

const ERROR_RHYMES = [
  "Oh no! The photo's a blur, I can't be sure. Try steady hands for a cure!",
  "This leaf is a mystery, it's hidden you see. Snap a clear one for me!",
  "Too dark to spark a thought in my brain. Please try the camera again!",
  "I'm stumped by this view, it's sad but true. A closer shot is overdue.",
  "My AI eyes are feeling weak, that image quality is quite bleak."
];

const App = () => {
  const [theme, toggleTheme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(plantDexService.getHistory());
  }, [results]); // Update history when new results come in

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleIdentify = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const base64Image = await fileToBase64(file);
      const data = await plantDexService.identifyPlant(base64Image);
      
      if (data.error) throw new Error(data.error);
      
      setResults(data.plants || []);
      if (!data.plants || data.plants.length === 0) {
        setError("I searched high and low, but this plant I do not know.");
      }
    } catch (e) {
      console.error(e);
      const randomRhyme = ERROR_RHYMES[Math.floor(Math.random() * ERROR_RHYMES.length)];
      setError(randomRhyme);
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

        {/* History Section */}
        {!isLoading && results.length === 0 && history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-12">
            <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-xs font-bold tracking-widest">
               <History size={14} /> Recent Discoveries
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {history.map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 opacity-75 hover:opacity-100 transition-opacity">
                      <div className="h-24 bg-gray-200 relative">
                         {item.image && <img src={item.image} className="w-full h-full object-cover" alt={item.name} />}
                      </div>
                      <div className="p-3">
                         <p className="font-bold text-sm truncate">{item.name}</p>
                         <p className="text-xs text-gray-500">{item.date}</p>
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