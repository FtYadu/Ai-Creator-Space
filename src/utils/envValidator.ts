/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
/**
 * Environment Variable Validation Utility
 * Validates required environment variables on application startup
 */

export class EnvironmentValidator {
  private static errors: string[] = [];
  private static warnings: string[] = [];

  /**
   * Validate all required environment variables
   */
  static validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    // Check Gemini API Key (required)
    const geminiKey =
      import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY;

    if (!geminiKey || geminiKey === 'your_api_key_here' || geminiKey.trim() === '') {
      this.errors.push(
        'GEMINI_API_KEY is not configured. Get your API key from https://aistudio.google.com/app/apikey'
      );
    } else if (geminiKey.length < 20) {
      this.warnings.push('GEMINI_API_KEY seems invalid (too short). Please verify your API key.');
    }

    // Check OpenWeather API Key (optional)
    const weatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!weatherKey || weatherKey === 'your_openweather_api_key_here') {
      this.warnings.push(
        'VITE_OPENWEATHER_API_KEY is not configured. Weather feature will use mock data. Get a key from https://openweathermap.org/api'
      );
    }

    // Check Node environment
    const nodeEnv = import.meta.env.MODE;
    if (nodeEnv !== 'production' && nodeEnv !== 'development') {
      this.warnings.push(`Unknown NODE_ENV: ${nodeEnv}. Expected 'production' or 'development'.`);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Log validation results to console
   */
  static logResults(): void {
    const result = this.validate();

    if (result.errors.length > 0) {
      console.error('❌ Environment Validation Failed:');
      result.errors.forEach((error) => console.error(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  Environment Warnings:');
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log('✅ Environment validation passed');
    }
  }

  /**
   * Get environment info for debugging
   */
  static getEnvironmentInfo(): Record<string, string | boolean> {
    return {
      mode: import.meta.env.MODE,
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      hasGeminiKey: !!(
        import.meta.env.VITE_GEMINI_API_KEY &&
        import.meta.env.VITE_GEMINI_API_KEY !== 'your_api_key_here'
      ),
      hasWeatherKey: !!(
        import.meta.env.VITE_OPENWEATHER_API_KEY &&
        import.meta.env.VITE_OPENWEATHER_API_KEY !== 'your_openweather_api_key_here'
      ),
    };
  }
}

// Auto-validate on import in development
if (import.meta.env.DEV) {
  EnvironmentValidator.logResults();
}
