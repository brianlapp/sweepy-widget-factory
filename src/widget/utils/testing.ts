import { WidgetError, WidgetTestConfig } from '../types';

export function createTestWidget(config: WidgetTestConfig) {
  console.group('[Widget Test] Creating test widget');
  console.log('Configuration:', config);
  
  const { containerId, sweepstakesId } = config;
  
  try {
    // Create container if it doesn't exist
    let container = document.getElementById(containerId);
    if (!container) {
      console.log('[Widget Test] Creating container element');
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Set sweepstakes ID and status
    container.setAttribute('data-sweepstakes-id', sweepstakesId);
    updateWidgetStatus(containerId, 'initializing');

    console.log('[Widget Test] Container ready, initializing widget');

    // Initialize widget
    if (window.initializeWidget) {
      window.initializeWidget(containerId);
      console.log('[Widget Test] Widget initialized successfully');
    } else {
      throw new Error('Widget initialization function not found');
    }
  } catch (error) {
    console.error('[Widget Test] Failed to create test widget:', error);
    logWidgetError({
      code: 'TEST_WIDGET_CREATION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    });
    updateWidgetStatus(containerId, 'error');
  } finally {
    console.groupEnd();
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

export function updateWidgetStatus(containerId: string, status: 'initializing' | 'ready' | 'error' | 'loading') {
  const container = document.getElementById(containerId);
  if (container) {
    const previousStatus = container.getAttribute('data-widget-status');
    container.setAttribute('data-widget-status', status);
    console.log(`[Widget Status] ${containerId}: ${previousStatus} -> ${status}`);
  }
}

export function getWidgetTestElement(containerId: string): HTMLElement | null {
  const element = document.getElementById(containerId);
  if (!element) {
    console.warn(`[Widget Test] Element with ID "${containerId}" not found`);
    return null;
  }
  return element;
}