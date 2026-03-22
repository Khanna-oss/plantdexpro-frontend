/**
 * Unit Tests for Geolocation Service
 * Tests location detection, caching, and fallback behavior
 */

import { geolocationService } from '../geolocationService.js';

describe('Geolocation Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should return user location when geolocation is successful', async () => {
    const mockPosition = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100
      }
    };

    // Mock successful geolocation
    navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const location = await geolocationService.getUserLocation();

    expect(location).toHaveProperty('latitude', 28.6139);
    expect(location).toHaveProperty('longitude', 77.2090);
    expect(location).toHaveProperty('accuracy', 100);
    expect(location).toHaveProperty('timestamp');
  });

  test('should return default location when geolocation fails', async () => {
    // Mock geolocation error
    navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'User denied geolocation' });
    });

    const location = await geolocationService.getUserLocation();

    expect(location).toHaveProperty('latitude', 28.6139);
    expect(location).toHaveProperty('longitude', 77.2090);
    expect(location).toHaveProperty('isDefault', true);
  });

  test('should cache location data in localStorage', async () => {
    const mockPosition = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100
      }
    };

    navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    await geolocationService.getUserLocation();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'plantdex_user_location_v1',
      expect.stringContaining('latitude')
    );
  });

  test('should clear location cache', () => {
    geolocationService.clearLocationCache();
    expect(localStorage.removeItem).toHaveBeenCalledWith('plantdex_user_location_v1');
  });
});
