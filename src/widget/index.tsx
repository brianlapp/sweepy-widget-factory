import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Declare the global interface for TypeScript
declare global {
  interface Window {
    initializeWidget: (sweepstakesId: string) => void;
  }
}

// Initialize widget with the provided sweepstakes ID
window.initializeWidget = function(sweepstakesId: string) {
  console.log('[Widget] Initializing with sweepstakes ID:', sweepstakesId);
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('[Widget] Root element not found');
    return;
  }

  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SweepstakesWidget 
          sweepstakesId={sweepstakesId}
          onReady={() => {
            console.log('[Widget] Ready');
            window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
          }}
        />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

// Export for type checking
export { SweepstakesWidget };