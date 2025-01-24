import { initializeWidget } from './core';
import { logger } from './utils/logger';

// Initialize error handling
window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Global error:', { message, source, lineno, colno, error });
};

// Export initialization function
window.initializeWidget = initializeWidget;

// Export types for external usage
export * from './types';

// Log initialization
logger.info('Widget bundle loaded successfully');

// Declare global types
declare global {
  interface Window {
    initializeWidget: typeof initializeWidget;
  }
}