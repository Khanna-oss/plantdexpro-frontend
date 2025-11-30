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
  }, [results]);

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
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-4">
            PlantDexPro
          </h1>
          <p className="text-lg text-gray-500">Identify plants instantly. Unlock recipes, safety tips, and care guides.</p>
        </div>

        <div className="max-w-xl mx-auto mb-12 relative z-10">
          <ImageUploader onIdentify={handleIdentify} isLoading={isLoading} onClear={handleClear} onPreview={setImagePreview} />
        </div>

        {isLoading && <div className="flex justify-center py-10"><Spinner /></div>}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 justify-center shadow-sm">
            <XCircle /> <span className="font-medium italic">"{error}"</span>
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="w-full animate-fade-in-up">
            <ResultsDisplay results={results} imagePreview={imagePreview} />
          </div>
        )}

        {!isLoading && results.length === 0 && history.length > 0 && (
            <div className="mt-16 border-t pt-8 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 justify-center">
                    <History size={14}/> Recent Scans
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    {history.map((h, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group cursor-pointer">
                            <div className="h-24 overflow-hidden"><img src={h.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/></div>
                            <div className="p-2 text-center"><p className="text-xs font-bold truncate">{h.name}</p></div>
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