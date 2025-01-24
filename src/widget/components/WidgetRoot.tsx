import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';

interface WidgetRootProps {
  sweepstakesId: string;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function WidgetRoot({ sweepstakesId }: WidgetRootProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="widget-container">
        <SweepstakesWidget 
          sweepstakesId={sweepstakesId}
        />
      </div>
    </QueryClientProvider>
  );
}