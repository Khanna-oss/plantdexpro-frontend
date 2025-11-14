import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

export const ImageUploader = ({ onIdentify, isLoading, onClear, onPreview }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      onPreview(previewUrl);
      onClear();
    } else if (file) {
      alert('Please select a valid image file (PNG, JPG, JPEG).');
    }
  }, [onClear, onPreview]);

  const onFileInputChange = (e) => {
    handleFile(e.target.files ? e.target.files[0] : null);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
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
    onPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear();
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or JPEG</p>
          </div>
          <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={onFileInputChange} />
        </div>
      ) : (
        <div className="text-center relative">
          <img src={URL.createObjectURL(selectedFile)} alt="Plant preview" className="mx-auto max-h-64 rounded-lg shadow-md" />
           <button onClick={handleClearClick} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors" aria-label="Remove image">
             <X size={16} />
           </button>
        </div>
      )}
      
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleIdentifyClick}
          disabled={!selectedFile || isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <span className="mr-2">🌿</span>
          {isLoading ? 'Identifying...' : 'Start Identification'}
        </button>
      </div>
    </div>
  );
};
