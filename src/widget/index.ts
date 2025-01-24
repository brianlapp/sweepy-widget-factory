import { initializeWidget } from './core';

declare global {
  interface Window {
    initializeWidget: (sweepstakesId: string) => void;
  }
}

// Export the initialize function to the global scope
window.initializeWidget = initializeWidget;

console.log('[Widget] Entry point loaded, initialization function exposed');

// Add version tracking
console.log(`[Widget] Version: ${process.env.VITE_APP_VERSION || 'development'}`);