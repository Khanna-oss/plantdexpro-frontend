import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export const ImageUploader = ({ onIdentify, isLoading, onClear, onPreview }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onPreview(url);
      onClear();
    } else if (file) {
      alert('Please select a valid image file (PNG, JPG, JPEG).');
    }
  }, [onClear, onPreview]);

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleIdentifyClick = () => {
    if (selectedFile) {
      onIdentify(selectedFile);
    }
  };

  const handleClearClick = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear();
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-emerald-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, or JPEG</p>
          </div>
          <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={onFileInputChange} />
        </div>
      ) : (
        <div className="relative text-center group">
          <div className="relative inline-block">
            <img src={previewUrl} alt="Plant preview" className="mx-auto max-h-64 rounded-lg shadow-md object-contain" />
            <button 
              onClick={handleClearClick} 
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm border-2 border-white dark:border-gray-800" 
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleIdentifyClick}
          disabled={!selectedFile || isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
               <Loader2 className="w-5 h-5 mr-2 animate-spin" />
               Identifying...
            </>
          ) : (
            <>
               <span className="mr-2">🌿</span>
               Start Identification
            </>
          )}
        </button>
      </div>
    </div>
  );
};