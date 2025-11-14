import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { useDarkMode } from './hooks/useDarkMode.js';

const App = () => {
  const [theme] = useDarkMode();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleIdentify = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const base64Image = await fileToBase64(file);
      
      // --- START MODIFIED BLOCK ---
      const baseUrl = import.meta.env.VITE_API_URL;
      
      if (!baseUrl) {
        // This error should only happen during local development if .env is missing
        throw new Error("API URL (VITE_API_URL) is not configured.");
      }
      
      const endpoint = `${baseUrl}/api/identify-plant`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });
      // --- END MODIFIED BLOCK ---

      if (!response.ok) {
        let errorData = { error: `HTTP error! status: ${response.status}`};
        try {
          errorData = await response.json();
        } catch (e) {
          // ignore if response is not json
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.plants || []);
      if (!data.plants || data.plants.length === 0) {
        setError("Could not identify any plants. Please try another image.");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
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
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans ${theme}`}>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary dark:text-primary-light">
            PlantDexPro
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Upload a picture of a plant and our AI will identify it for you.
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <ImageUploader onIdentify={handleIdentify} isLoading={isLoading} onClear={handleClear} onPreview={setImagePreview} />
        </div>
        
        {isLoading && (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        )}

        {error && !isLoading && (
           <div className="mt-12 max-w-2xl mx-auto text-center bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="mt-16">
            <ResultsDisplay results={results} imagePreview={imagePreview} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;