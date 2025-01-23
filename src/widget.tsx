import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Storage URL for origin checking
const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';

function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
  React.useEffect(() => {
    // Function to update iframe height
    const updateIframeHeight = () => {
      const height = document.documentElement.scrollHeight;
      // Only send message if we're in an iframe
      if (window !== window.parent) {
        try {
          // Get the origin from STORAGE_URL
          const storageOrigin = new URL(STORAGE_URL).origin;
          window.parent.postMessage({ type: 'setHeight', height }, storageOrigin);
          console.log('[Widget] Sent height update:', height, 'to origin:', storageOrigin);
        } catch (error) {
          console.error('[Widget] Error sending height update:', error);
        }
      }
    };

    // Set up height observer
    const observer = new ResizeObserver(() => {
      updateIframeHeight();
    });

    // Observe body for size changes
    observer.observe(document.body);

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </QueryClientProvider>
  );
}

// Initialize the widget when the script loads
function initializeWidget(sweepstakesId: string) {
  console.log('[Widget] Initializing widget...');
  
  try {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    // Validate that we have a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sweepstakesId)) {
      throw new Error('Invalid sweepstakes ID format');
    }

    console.log('[Widget] Creating widget with sweepstakes ID:', sweepstakesId);
    
    createRoot(root).render(
      <React.StrictMode>
        <WidgetRoot sweepstakesId={sweepstakesId} />
      </React.StrictMode>
    );
    
    console.log('[Widget] Widget initialized successfully');
  } catch (error) {
    console.error('[Widget] Initialization error:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0;">Unable to load sweepstakes widget. Please try again later.</p>
          <p style="color: #888; font-size: 0.8em; margin-top: 8px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Export for use in iframe
(window as any).initializeWidget = initializeWidget;