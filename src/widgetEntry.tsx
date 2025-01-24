import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from './components/SweepstakesWidget';

const queryClient = new QueryClient();

function WidgetRoot() {
  const sweepstakesId = (window as any).SWEEPSTAKES_ID;

  React.useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);
    
    return () => observer.disconnect();
  }, []);

  if (!sweepstakesId) {
    console.error('No sweepstakes ID provided');
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