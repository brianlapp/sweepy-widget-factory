import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface WidgetRootProps {
  sweepstakesId: string;
}

export function WidgetRoot({ sweepstakesId }: WidgetRootProps) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </QueryClientProvider>
  );
}