import React from 'react'

export default function ResultCard({ plant, index }){
  const { scientificName, commonName, confidenceScore, imageUrl, isEdible } = plant
  return (
    <article className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 rounded-lg p-4 shadow">
      <div className="flex gap-4">
        <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {imageUrl ? <img src={imageUrl} alt={commonName||scientificName} className="object-cover w-full h-full" /> : <div className="text-3xl">🌿</div>}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-semibold">{scientificName || commonName || 'Unknown'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{commonName || ''}</div>
            </div>
            <div className="text-sm text-gray-500">#{index}</div>
          </div>

          <div className="mt-3">
            <div className="text-sm">Confidence: {(confidenceScore||0).toFixed ? (confidenceScore*100).toFixed(1)+'%' : confidenceScore}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 bg-primary text-white rounded">Save to Favorites</button>
              {isEdible && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Edible</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
