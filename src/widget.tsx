import React from 'react';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Make SweepstakesWidget available globally
declare global {
  interface Window {
    SweepstakesWidget: typeof SweepstakesWidget;
  }
}

// Expose the component globally
window.SweepstakesWidget = SweepstakesWidget;

// Export the wrapped component with QueryClientProvider
export function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </QueryClientProvider>
  );
}