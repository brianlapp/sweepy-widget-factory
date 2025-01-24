import React from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetRoot } from './components/WidgetRoot';
import { WidgetState, WidgetError, WidgetMessage } from './types';

const widgetState: WidgetState = {
  isLoading: true,
  error: null
};

const updateWidgetStatus = (state: WidgetState) => {
  window.parent.postMessage({ type: state.error ? 'WIDGET_ERROR' : 'WIDGET_STATUS', state }, '*');
};

export const logger = {
  info: (msg: string) => {
    console.log(`[Widget] ${msg}`);
  },
  error: (msg: string, error?: Error) => {
    console.error(`[Widget Error] ${msg}`, error);
    const widgetError: WidgetError = {
      name: 'WidgetError',
      code: 'ERROR',
      message: msg,
      details: error?.stack
    };
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR', 
      error: widgetError 
    } as WidgetMessage, '*');
  }
};

export function initializeWidget(containerId = 'root') {
  try {
    logger.info('Initializing widget...');
    widgetState.isLoading = true;
    updateWidgetStatus(widgetState);

    const root = document.getElementById(containerId);
    if (!root) {
      throw new Error('Root element not found');
    }

    const sweepstakesId = root.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      throw new Error('No sweepstakes ID provided');
    }

    const config = {
      storageUrl: process.env.STORAGE_URL || '',
      version: process.env.VERSION || '1.0.0',
      sweepstakesId
    };

    createRoot(root).render(
      <WidgetRoot
        config={config}
        onReady={() => {
          widgetState.isLoading = false;
          widgetState.error = null;
          updateWidgetStatus(widgetState);
          window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        }}
        onError={(error: WidgetError) => logger.error(error.message)}
      />
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to initialize widget', error);
    }
  }
}