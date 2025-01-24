import { WidgetError, WidgetTestConfig } from '../types';

export function createTestWidget(config: WidgetTestConfig) {
  const { containerId, sweepstakesId } = config;
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Set sweepstakes ID
  container.setAttribute('data-sweepstakes-id', sweepstakesId);

  console.log('[Widget Test] Creating test widget with config:', config);

  // Initialize widget
  if (window.initializeWidget) {
    window.initializeWidget(containerId);
  } else {
    console.error('[Widget Test] Widget initialization function not found');
  }
}

export function logWidgetError(error: WidgetError) {
  console.group('[Widget Error]');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  if (error.details) {
    console.error('Details:', error.details);
  }
  console.groupEnd();
}

export function updateWidgetStatus(containerId: string, status: string) {
  const container = document.getElementById(containerId);
  if (container) {
    container.setAttribute('data-widget-status', status);
  }
}