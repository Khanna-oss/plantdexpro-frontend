import React from 'react'
import ResultCard from './ResultCard'

export default function ResultsDisplay({ isLoading, results, error, imagePreview }){
  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      {imagePreview && (
        <div className="mb-4 text-center">
          <img src={imagePreview} alt="uploaded preview" className="mx-auto h-48 object-contain rounded-md shadow" />
        </div>
      )}

      {isLoading && <div className="text-center py-4">🔄 Identifying…</div>}
      {error && <div className="text-red-500">Error: {String(error)}</div>}
      {!isLoading && !error && !results && (
        <div className="text-gray-500">No results yet — upload an image and click Start Identification.</div>
      )}
      {!isLoading && results && Array.isArray(results) && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r, i) => <ResultCard key={i} plant={r} index={i+1} />)}
        </div>
      )}
    </section>
  )
}
