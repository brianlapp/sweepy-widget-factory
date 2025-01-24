import { WidgetError, WidgetState } from '../types';

export function createTestWidget(containerId: string, sweepstakesId: string): void {
  console.log('[Widget Test] Creating test widget:', { containerId, sweepstakesId });
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[Widget Test] Container not found:', containerId);
    return;
  }

  // Clear existing content
  container.innerHTML = '';
  
  // Set data attribute
  container.setAttribute('data-sweepstakes-id', sweepstakesId);
  
  // Initialize widget
  if (window.initializeWidget) {
    window.initializeWidget();
  } else {
    console.error('[Widget Test] Widget initialization function not found');
  }
}

export function logWidgetError(error: WidgetError): void {
  console.group('[Widget Error]');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  if (error.context) {
    console.error('Context:', error.context);
  }
  if (error.details) {
    console.error('Details:', error.details);
  }
  console.groupEnd();
}

export function updateWidgetStatus(state: WidgetState): void {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  if (!statusIndicator || !statusText) return;
  
  if (state.error) {
    statusIndicator.className = 'status-indicator error';
    statusText.textContent = `Error: ${state.error.message}`;
    logWidgetError(state.error);
  } else if (state.isLoading) {
    statusIndicator.className = 'status-indicator';
    statusText.textContent = 'Loading widget...';
  } else if (state.isReady) {
    statusIndicator.className = 'status-indicator ready';
    statusText.textContent = 'Widget is ready';
  }
}