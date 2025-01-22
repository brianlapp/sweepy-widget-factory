import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Create the root component that includes the QueryClientProvider
function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </QueryClientProvider>
  );
}

// Initialize the widget when the script loads
function initializeWidget() {
  const container = document.getElementById('sweepstakes-widget');
  if (!container) {
    console.error('Widget container not found');
    return;
  }

  const sweepstakesId = container.getAttribute('data-sweepstakes-id');
  if (!sweepstakesId) {
    console.error('No sweepstakes ID provided');
    return;
  }

  // Validate that we have a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sweepstakesId)) {
    console.error('Invalid sweepstakes ID format');
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <WidgetRoot sweepstakesId={sweepstakesId} />
    </React.StrictMode>
  );
}

// Export for use in iframe
export { WidgetRoot };

// Initialize if we're not in an iframe
if (window.top === window.self) {
  initializeWidget();
}