/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { availableTools } from '../services/geminiService';

describe('Gemini Service', () => {
  describe('availableTools - Weather (Mock Data)', () => {
    beforeEach(() => {
      // Ensure no API key is set for mock data tests
      vi.stubEnv('VITE_OPENWEATHER_API_KEY', undefined);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return weather data for Tokyo', async () => {
      const result = await availableTools.get_current_weather({ location: 'Tokyo' });
      expect(result).toEqual({ weather: 'sunny', temperature: '22°C' });
    });

    it('should return weather data for London', async () => {
      const result = await availableTools.get_current_weather({ location: 'London' });
      expect(result).toEqual({ weather: 'rainy', temperature: '12°C' });
    });

    it('should return weather data for New York', async () => {
      const result = await availableTools.get_current_weather({ location: 'New York' });
      expect(result).toEqual({ weather: 'cloudy', temperature: '18°C' });
    });

    it('should return weather data for Sydney', async () => {
      const result = await availableTools.get_current_weather({ location: 'Sydney' });
      expect(result).toEqual({ weather: 'sunny', temperature: '26°C' });
    });

    it('should return weather data for Paris', async () => {
      const result = await availableTools.get_current_weather({ location: 'Paris' });
      expect(result).toEqual({ weather: 'partly cloudy', temperature: '15°C' });
    });

    it('should return default weather data for unknown locations', async () => {
      const result = await availableTools.get_current_weather({ location: 'Unknown City' });
      expect(result).toEqual({ weather: 'clear', temperature: '25°C' });
    });

    it('should handle case-insensitive location matching', async () => {
      const result1 = await availableTools.get_current_weather({ location: 'TOKYO' });
      const result2 = await availableTools.get_current_weather({ location: 'tokyo' });
      const result3 = await availableTools.get_current_weather({ location: 'ToKyO' });

      expect(result1).toEqual({ weather: 'sunny', temperature: '22°C' });
      expect(result2).toEqual({ weather: 'sunny', temperature: '22°C' });
      expect(result3).toEqual({ weather: 'sunny', temperature: '22°C' });
    });

    it('should handle partial location matching', async () => {
      const result = await availableTools.get_current_weather({ location: 'Tokyo, Japan' });
      expect(result).toEqual({ weather: 'sunny', temperature: '22°C' });
    });
  });

  describe('availableTools - Weather (Real API)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test_api_key');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it('should fall back to mock data if API call fails', async () => {
      // Mock fetch to simulate API failure
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const result = await availableTools.get_current_weather({ location: 'Tokyo' });
      expect(result).toEqual({ weather: 'sunny', temperature: '22°C' });
    });

    it('should fall back to mock data if API returns non-OK status', async () => {
      // Mock fetch to simulate 404 error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        } as Response)
      );

      const result = await availableTools.get_current_weather({ location: 'Invalid City' });
      expect(result).toEqual({ weather: 'clear', temperature: '25°C' });
    });
  });
});
