import React, { useRef, useState } from 'react'
import { UploadCloud, Camera } from 'lucide-react'

export default function ImageUploader({ onPreview, onIdentify }){
  const inputRef = useRef()
  const [selectedFile, setSelectedFile] = useState(null)

  function handleFile(f){
    if (!f) return
    setSelectedFile(f)
    const reader = new FileReader()
    reader.onload = ()=> {
      onPreview && onPreview(reader.result)
    }
    reader.readAsDataURL(f)
  }

  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <label className="block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Upload Image</h2>
          <div className="text-sm text-gray-500">Accepts PNG, JPG, WEBP</div>
        </div>
        <div
          onClick={()=>inputRef.current.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded p-6 text-center cursor-pointer hover:border-gray-400"
        >
          <UploadCloud className="mx-auto" />
          <div className="mt-2">Drag & drop or click to select an image</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e)=> handleFile(e.target.files?.[0])}
            aria-label="Upload image file"
          />
        </div>

        {selectedFile && (
          <div className="mt-4 flex gap-3 items-center">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              className="h-28 w-28 object-cover rounded-md shadow-sm"
            />
            <div className="flex-1">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-500">{(selectedFile.size/1024).toFixed(0)} KB</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={()=> onIdentify(selectedFile)}
                  className="px-3 py-1 bg-primary text-white rounded"
                  aria-label="Start Identification"
                >Start Identification</button>
                <button
                  onClick={()=> { setSelectedFile(null); onPreview && onPreview(null) }}
                  className="px-3 py-1 border rounded"
                >Remove</button>
              </div>
            </div>
          </div>
        )}
      </label>
    </section>
  )
}
