import { createRoot } from 'react-dom/client';
import { WidgetRoot } from './components/WidgetRoot';
import type { WidgetConfig, WidgetError, WidgetState } from './types';

const widgetState: WidgetState = {
  isReady: false,
  hasError: false,
};

const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[Widget] ${msg}`, ...args);
    window.parent.postMessage({ type: 'WIDGET_INFO', message: msg }, '*');
  },
  error: (msg: string, error?: Error) => {
    console.error(`[Widget Error] ${msg}`, error);
    const widgetError: WidgetError = {
      name: 'WidgetError',
      message: msg,
      code: error?.name,
      context: error,
    };
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR', 
      error: widgetError
    }, '*');
    widgetState.hasError = true;
    widgetState.error = widgetError;
  }
};

export function initializeWidget(sweepstakesId: string) {
  logger.info('Initializing widget with ID:', sweepstakesId);
  
  try {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    const config: WidgetConfig = {
      sweepstakesId,
      version: process.env.VITE_APP_VERSION,
      environment: process.env.NODE_ENV as 'development' | 'production'
    };

    createRoot(root).render(
      <WidgetRoot 
        sweepstakesId={sweepstakesId}
        onReady={() => {
          widgetState.isReady = true;
          logger.info('Widget initialized successfully');
          window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        }}
        onError={(error: Error) => {
          logger.error('Widget error:', error);
        }}
      />
    );
    
  } catch (error) {
    logger.error('Initialization failed:', error as Error);
    throw error;
  }
}