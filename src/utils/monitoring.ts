/* eslint-disable @typescript-eslint/no-explicit-any, no-console, no-undef */
/**
 * Monitoring and Error Tracking Utility
 * Provides error tracking, performance monitoring, and analytics
 */

interface MonitoringConfig {
  sentryDsn?: string;
  environment: string;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private config: MonitoringConfig;
  private errorQueue: Array<{ error: Error; context?: ErrorContext; timestamp: number }> = [];

  private constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      environment: import.meta.env.MODE || 'development',
      enablePerformanceMonitoring: import.meta.env.PROD,
      enableErrorTracking: import.meta.env.PROD,
      ...config,
    };

    this.initializeErrorTracking();
    this.initializePerformanceMonitoring();
  }

  static getInstance(config?: Partial<MonitoringConfig>): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService(config);
    }
    return MonitoringService.instance;
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        component: 'window',
        action: 'global_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        component: 'window',
        action: 'unhandled_promise_rejection',
      });
    });

    console.log('✅ Error tracking initialized');
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor page load performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          if (perfData) {
            this.trackPerformance('page_load', {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              ttfb: perfData.responseStart - perfData.requestStart,
              download: perfData.responseEnd - perfData.responseStart,
              domInteractive: perfData.domInteractive,
              domComplete: perfData.domComplete,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            });
          }
        }, 0);
      });
    }

    console.log('✅ Performance monitoring initialized');
  }

  /**
   * Capture and log errors
   */
  captureError(error: Error, context?: ErrorContext): void {
    const errorEntry = {
      error,
      context,
      timestamp: Date.now(),
    };

    this.errorQueue.push(errorEntry);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('🔴 Error captured:', error);
      if (context) console.error('Context:', context);
    }

    // In production, you would send to error tracking service
    if (import.meta.env.PROD) {
      this.sendToErrorService(errorEntry);
    }

    // Keep error queue size manageable
    if (this.errorQueue.length > 100) {
      this.errorQueue.shift();
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, data: Record<string, number>): void {
    if (!this.config.enablePerformanceMonitoring) return;

    if (import.meta.env.DEV) {
      console.log(`📊 Performance: ${metric}`, data);
    }

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      this.sendToAnalyticsService({ type: 'performance', metric, data, timestamp: Date.now() });
    }
  }

  /**
   * Track user events
   */
  trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
    };

    if (import.meta.env.DEV) {
      console.log('📈 Event:', event);
    }

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      this.sendToAnalyticsService({ type: 'event', ...event });
    }
  }

  /**
   * Send error to external service (placeholder for Sentry, etc.)
   */
  private sendToErrorService(errorEntry: any): void {
    // Placeholder for Sentry or other error tracking service
    // Example: Sentry.captureException(errorEntry.error, { extra: errorEntry.context });

    // For now, just log that we would send it
    console.debug('Would send error to tracking service:', errorEntry);
  }

  /**
   * Send analytics to external service (placeholder)
   */
  private sendToAnalyticsService(data: any): void {
    // Placeholder for Google Analytics, Mixpanel, etc.
    // Example: gtag('event', data.action, { event_category: data.category, ... });

    // For now, just log that we would send it
    console.debug('Would send analytics:', data);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    recent: number;
    byComponent: Record<string, number>;
  } {
    const oneHourAgo = Date.now() - 3600000;
    const recentErrors = this.errorQueue.filter((e) => e.timestamp > oneHourAgo);

    const byComponent: Record<string, number> = {};
    this.errorQueue.forEach((entry) => {
      const component = entry.context?.component || 'unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
    });

    return {
      total: this.errorQueue.length,
      recent: recentErrors.length,
      byComponent,
    };
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience functions
export const captureError = (error: Error, context?: ErrorContext) =>
  monitoring.captureError(error, context);

export const trackPerformance = (metric: string, data: Record<string, number>) =>
  monitoring.trackPerformance(metric, data);

export const trackEvent = (category: string, action: string, label?: string, value?: number) =>
  monitoring.trackEvent(category, action, label, value);
