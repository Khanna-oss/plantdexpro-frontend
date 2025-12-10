/**
 * Compresses and resizes an image file to ensure it fits within API payload limits.
 * Targets a max dimension of 1024px and converts to JPEG.
 * 
 * @param {File} file - The uploaded image file
 * @returns {Promise<string>} - Base64 string of the compressed image (raw, no data URI prefix)
 */
export const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1024px is optimal for Gemini Vision (balances detail vs speed)
          const MAX_SIZE = 1024;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG at 80% quality
          // This typically reduces a 5MB phone photo to ~100-200KB
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Remove the "data:image/jpeg;base64," prefix to get raw base64 for the API
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        };
        
        img.onerror = (err) => reject(new Error("Failed to load image for compression"));
      };
      
      reader.onerror = (err) => reject(new Error("Failed to read file"));
    });
  };