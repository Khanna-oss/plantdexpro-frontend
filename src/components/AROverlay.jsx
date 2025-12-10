
import React from 'react';

// STUB: 2030 Feature - AR Overlay
// This component will eventually handle WebXR sessions and 3D plant highlighting.
export const AROverlay = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
        <span className="animate-pulse">AR Live Mode: Scanning Environment...</span>
      </div>
      {/* 
        TODO: Integrate Three.js / @react-three/xr here.
        This layer will overlay toxicity warnings directly on the camera feed.
      */}
    </div>
  );
};
