import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '../components/SweepstakesWidget';
import { logger } from './utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function initializeWidget(sweepstakesId: string) {
  logger.info('Initializing widget with sweepstakes ID:', sweepstakesId);
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SweepstakesWidget 
          sweepstakesId={sweepstakesId}
          onReady={() => logger.info('Widget mounted successfully')}
        />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Make the initialization function available globally
declare global {
  interface Window {
    initializeWidget: typeof initializeWidget;
  }
}

window.initializeWidget = initializeWidget;
logger.info(`Widget version ${process.env.VITE_APP_VERSION} initialized`);