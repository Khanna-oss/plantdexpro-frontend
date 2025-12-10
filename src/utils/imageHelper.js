/**
 * Compresses an image file to ensure it fits within API payload limits.
 * Resizes images larger than 1024px and reduces quality slightly.
 * 
 * @param {File} file - The uploaded image file
 * @returns {Promise<string>} - Base64 string of the compressed image (no data:image/jpeg;base64, prefix)
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
          
          // Max dimension 1024px to keep payload light for Gemini
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
          
          // Compress to JPEG at 70% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Remove the prefix to get raw base64
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        };
        
        img.onerror = (err) => reject(new Error("Failed to load image for compression"));
      };
      
      reader.onerror = (err) => reject(new Error("Failed to read file"));
    });
  };