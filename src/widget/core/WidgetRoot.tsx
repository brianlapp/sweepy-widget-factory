import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { WidgetConfig, WidgetError } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '../utils/logger';

interface WidgetRootProps {
  config: WidgetConfig;
  onReady?: () => void;
  onError?: (error: WidgetError) => void;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function WidgetRoot({ config, onReady, onError }: WidgetRootProps) {
  React.useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    logger.info('WidgetRoot mounted');
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.documentElement);

    return () => {
      logger.info('WidgetRoot unmounted');
      observer.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary onError={onError}>
      <QueryClientProvider client={queryClient}>
        <SweepstakesWidget 
          sweepstakesId={config.sweepstakesId || ''} 
          onReady={onReady}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}