import { initializeWidget } from './core/WidgetLoader';
import { createTestWidget } from './utils/testing';
import { logger } from './utils/logger';

// Export the main widget initialization function
export { initializeWidget, createTestWidget, logger };

// Make the initialization function available globally
declare global {
  interface Window {
    initializeWidget: typeof initializeWidget;
  }
}

window.initializeWidget = initializeWidget;

logger.info(`Widget version ${process.env.VITE_APP_VERSION} initialized`);