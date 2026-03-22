/**
 * Geolocation Service
 * Handles user location detection for regional environmental queries
 */

const CACHE_KEY = 'plantdex_user_location_v1';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get user's current location
 */
export const getUserLocation = async () => {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }

  // Request new location
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        // Cache the location
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: location,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Cache write error:', e);
        }

        resolve(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Return default location (New Delhi, India) as fallback
        const defaultLocation = {
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: null,
          timestamp: Date.now(),
          isDefault: true
        };
        resolve(defaultLocation);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: CACHE_TTL
      }
    );
  });
};

/**
 * Get location name from coordinates using reverse geocoding
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const data = await response.json();
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      state: data.address?.state || '',
      country: data.address?.country || 'Unknown',
      displayName: data.display_name || 'Unknown Location'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Unknown',
      state: '',
      country: 'Unknown',
      displayName: 'Unknown Location'
    };
  }
};

/**
 * Clear location cache
 */
export const clearLocationCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

export const geolocationService = {
  getUserLocation,
  getLocationName,
  clearLocationCache
};
