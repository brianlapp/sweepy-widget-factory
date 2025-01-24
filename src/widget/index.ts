import { initializeWidget } from './core';

// Make the initialization function globally available
declare global {
  interface Window {
    initializeWidget: (sweepstakesId: string) => void;
  }
}

window.initializeWidget = initializeWidget;

// Initialize widget if data-sweepstakes-id is present
document.addEventListener('DOMContentLoaded', () => {
  const widgetContainer = document.getElementById('sweepstakes-widget');
  if (widgetContainer) {
    const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
    if (sweepstakesId) {
      // Create root element
      const root = document.createElement('div');
      root.id = 'root';
      widgetContainer.appendChild(root);
      
      // Initialize widget
      initializeWidget(sweepstakesId);
    } else {
      console.error('[Widget] No sweepstakes ID provided');
    }
  }
});