
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { useDarkMode } from './hooks/useDarkMode.js';
import { plantDexService } from './services/plantDexService.js';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

const App = () => {
  const [theme, toggleTheme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
         const result = reader.result;
         resolve(result.split(',')[1]);
      };
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
        setError("Could not identify any plants. Please try another image.");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e.message || 'An unknown error occurred.';
      setError(`Failed to identify plant. ${errorMessage}`);
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
      
      {/* Updated Container: Uses almost full width (max-w-7xl) for a widescreen feel */}
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-6">
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
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="w-full animate-fade-in-up">
            <ResultsDisplay results={results} imagePreview={imagePreview} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;