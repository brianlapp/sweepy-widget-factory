import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from './components/SweepstakesWidget';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function WidgetRoot() {
  const sweepstakesId = (window as any).SWEEPSTAKES_ID;

  React.useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    // Initial height update
    updateHeight();

    // Setup resize observer
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);

    // Report ready state
    window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
    
    return () => observer.disconnect();
  }, []);

  if (!sweepstakesId) {
    console.error('[Widget] No sweepstakes ID provided');
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR',
      error: { message: 'No sweepstakes ID provided' }
    }, '*');
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </QueryClientProvider>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <WidgetRoot />
    </React.StrictMode>
  );
}