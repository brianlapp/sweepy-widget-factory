import { createRoot } from 'react-dom/client';
import { WidgetRoot } from './components/WidgetRoot';
import { WidgetState, WidgetError, WidgetConfig } from './types';
import { updateWidgetStatus, logWidgetError } from './utils/testing';

const widgetState: WidgetState = {
  isReady: false,
  isLoading: false,
  error: null
};

const logger = {
  info: (msg: string) => {
    console.info(`[Widget] ${msg}`);
  },
  error: (msg: string, error?: Error) => {
    console.error(`[Widget Error] ${msg}`, error);
    const widgetError: WidgetError = {
      code: error?.name || 'ERROR',
      message: msg,
      context: error,
    };
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR', 
      error: widgetError
    }, '*');
    widgetState.error = widgetError;
    updateWidgetStatus(widgetState);
  }
};

export function initializeWidget() {
  try {
    logger.info('Initializing widget...');
    widgetState.isLoading = true;
    updateWidgetStatus(widgetState);

    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    const config: WidgetConfig = {
      version: process.env.VITE_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV as 'development' | 'production',
      storageUrl: process.env.VITE_STORAGE_URL || ''
    };

    createRoot(root).render(
      <WidgetRoot 
        config={config}
        onReady={() => {
          widgetState.isReady = true;
          widgetState.isLoading = false;
          updateWidgetStatus(widgetState);
          window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        }}
        onError={(error) => logger.error(error.message, error.context)}
      />
    );
  } catch (error) {
    logger.error('Failed to initialize widget', error as Error);
  }
}