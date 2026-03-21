import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export const ImageUploader = ({ onIdentify, isLoading, loadingMessage, onClear, onPreview }) => {
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
    <div className="w-full soil-shell p-6 sm:p-8 transition-all duration-300 relative overflow-hidden">
      <div className="texture-overlay" />
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="glass-card relative flex flex-col items-center justify-center w-full h-64 border border-dashed border-[rgba(245,245,220,0.22)] cursor-pointer transition-colors group hover:border-[var(--golden-soil)] hover:bg-white/10"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-[rgba(199,144,22,0.14)] rounded-full mb-3 group-hover:scale-110 transition-transform border border-[rgba(245,245,220,0.12)]">
              <UploadCloud className="w-10 h-10 text-[var(--golden-soil)]" />
            </div>
            <p className="mb-2 text-sm text-[var(--cream)] font-medium text-center">
              <span className="font-semibold text-[var(--golden-soil)] hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-body-muted tracking-wide">PNG, JPG, or JPEG</p>
          </div>
          <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={onFileInputChange} />
        </div>
      ) : (
        <div className="relative text-center group">
          <div className="relative inline-block glass-card p-3">
            <img src={previewUrl} alt="Plant preview" className="mx-auto max-h-64 rounded-[16px] shadow-md object-contain" />
            <button 
              onClick={handleClearClick} 
              className="absolute -top-3 -right-3 bg-[var(--dark-burgundy)] text-white rounded-full p-1.5 hover:bg-[var(--clay-brown)] transition-colors shadow-sm border-2 border-[rgba(245,245,220,0.25)]" 
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col justify-center gap-3 relative z-10">
        <button
          onClick={handleIdentifyClick}
          disabled={!selectedFile || isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3.5 text-base font-semibold glass-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--golden-soil)] disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
               <Loader2 className="w-5 h-5 mr-2 animate-spin" />
               <span className="truncate">{loadingMessage || 'Stage 1: Feature Extraction & Scalar Value Mapping...'}</span>
            </>
          ) : (
            <>
               <span className="mr-2">🌿</span>
               Start Identification
            </>
          )}
        </button>
        {isLoading && loadingMessage && (
          <div className="glass-card px-4 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-[var(--cream)]">
            {loadingMessage}
          </div>
        )}
      </div>
    </div>
  );
};