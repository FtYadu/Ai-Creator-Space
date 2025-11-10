import { describe, it, expect } from 'vitest';
import { availableTools } from '../services/geminiService';

describe('Gemini Service', () => {
  describe('availableTools', () => {
    it('should return weather data for Tokyo', () => {
      const result = availableTools.get_current_weather({ location: 'Tokyo' });
      expect(result).toEqual({ weather: 'sunny', temperature: '22°C' });
    });

    it('should return weather data for London', () => {
      const result = availableTools.get_current_weather({ location: 'London' });
      expect(result).toEqual({ weather: 'rainy', temperature: '12°C' });
    });

    it('should return default weather data for unknown locations', () => {
      const result = availableTools.get_current_weather({ location: 'Paris' });
      expect(result).toEqual({ weather: 'clear', temperature: '25°C' });
    });
  });
});
