import React, { useState } from 'react'
import Header from './components/Header'
import ImageUploader from './components/ImageUploader'
import ResultsDisplay from './components/ResultsDisplay'
import Footer from './components/Footer'

const BACKEND = import.meta.env.VITE_API_URL || 'https://plantdexpro-backend.onrender.com'

export default function App(){
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)

  async function identifyImage(file){
    setError(null)
    setResults(null)
    setIsLoading(true)

    try {
      // if you want to send to backend, send base64 or multipart
      const form = new FormData()
      form.append('image', file)

      const res = await fetch(`${BACKEND}/api/identify-plant`, {
        method: 'POST',
        body: form
      })

      if (!res.ok){
        const txt = await res.text()
        throw new Error(txt || 'Server returned error')
      }

      const data = await res.json()
      // expected shape: { plants: [...] }
      setResults(data.plants ?? data)
    } catch (e){
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <ImageUploader
          onPreview={(dataUrl)=>setImageDataUrl(dataUrl)}
          onIdentify={(file)=>identifyImage(file)}
        />
        <ResultsDisplay
          isLoading={isLoading}
          results={results}
          error={error}
          imagePreview={imageDataUrl}
        />
      </main>
      <Footer />
    </div>
  )
}
