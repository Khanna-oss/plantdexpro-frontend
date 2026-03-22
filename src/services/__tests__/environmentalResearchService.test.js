/**
 * Unit Tests for Environmental Research Service
 * Tests API integration and data fetching for research modules
 */

import { environmentalResearchService } from '../environmentalResearchService.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('Environmental Research Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Air Quality Data (OpenAQ)', () => {
    test('should fetch air quality data successfully', async () => {
      const mockResponse = {
        results: [
          {
            location: 'Test Station',
            city: 'Test City',
            country: 'Test Country',
            measurements: [
              { parameter: 'pm25', value: 35.5, unit: 'µg/m³', lastUpdated: '2024-01-01' }
            ],
            coordinates: { latitude: 28.6139, longitude: 77.2090 }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await environmentalResearchService.getAirQualityData(28.6139, 77.2090);

      expect(result).toHaveProperty('available', true);
      expect(result).toHaveProperty('pm25');
      expect(result.pm25.value).toBe(35.5);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.openaq.org'),
        expect.any(Object)
      );
    });

    test('should return unavailable when API fails', async () => {
      fetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await environmentalResearchService.getAirQualityData(28.6139, 77.2090);

      expect(result).toHaveProperty('available', false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('Weather History Data (Open Meteo)', () => {
    test('should fetch weather data successfully', async () => {
      const mockCurrentWeather = {
        current: {
          temperature_2m: 25.5,
          precipitation: 0,
          wind_speed_10m: 5.2
        },
        current_units: {
          temperature_2m: '°C',
          precipitation: 'mm'
        }
      };

      const mockHistoricalWeather = {
        daily: {
          temperature_2m_mean: [22.3],
          precipitation_sum: [0.5]
        }
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrentWeather
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistoricalWeather
        });

      const result = await environmentalResearchService.getWeatherHistoryData(28.6139, 77.2090);

      expect(result).toHaveProperty('available', true);
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('historical30Days');
      expect(result.current.temperature).toBe(25.5);
    });
  });

  describe('Biodiversity Data (GBIF)', () => {
    test('should fetch biodiversity data successfully', async () => {
      const mockResponse = {
        count: 1250
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await environmentalResearchService.getBiodiversityData(28.6139, 77.2090);

      expect(result).toHaveProperty('available', true);
      expect(result).toHaveProperty('speciesCount', 1250);
      expect(result).toHaveProperty('richness', 'high');
    });

    test('should classify biodiversity richness correctly', async () => {
      // Clear cache before each classification test
      localStorage.clear();
      
      // Test moderate richness
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 500 })
      });

      const moderateResult = await environmentalResearchService.getBiodiversityData(28.6, 77.2);
      expect(moderateResult.richness).toBe('moderate');

      // Clear cache again
      localStorage.clear();
      
      // Test low richness
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 50 })
      });

      const lowResult = await environmentalResearchService.getBiodiversityData(28.5, 77.1);
      expect(lowResult.richness).toBe('low');
    });
  });

  describe('getAllResearchData', () => {
    test('should fetch all research data in parallel', async () => {
      // Mock all API responses
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [], count: 0, data: [] })
      });

      const result = await environmentalResearchService.getAllResearchData(28.6139, 77.2090);

      expect(result).toHaveProperty('airQuality');
      expect(result).toHaveProperty('deforestation');
      expect(result).toHaveProperty('climate');
      expect(result).toHaveProperty('satellite');
      expect(result).toHaveProperty('carbon');
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('biodiversity');
    });

    test('should handle partial API failures gracefully', async () => {
      // Mock some APIs to fail
      fetch
        .mockRejectedValueOnce(new Error('API 1 failed'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockRejectedValueOnce(new Error('API 3 failed'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
        .mockRejectedValueOnce(new Error('API 6 failed'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ count: 100 }) });

      const result = await environmentalResearchService.getAllResearchData(28.6139, 77.2090);

      // Should still return object with all properties
      expect(result).toBeDefined();
      expect(result.airQuality).toHaveProperty('available');
      expect(result.biodiversity).toHaveProperty('available');
    });
  });
});
