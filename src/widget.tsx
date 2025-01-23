import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Storage URL for origin checking
const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[Widget] Error caught in boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Widget] Error details:', error, errorInfo);
    // Send error to parent window
    if (window !== window.parent) {
      try {
        const storageOrigin = new URL(STORAGE_URL).origin;
        window.parent.postMessage({ 
          type: 'error', 
          message: error.message 
        }, storageOrigin);
      } catch (e) {
        console.error('[Widget] Error sending error message to parent:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-600">Something went wrong loading the sweepstakes.</p>
          <p className="text-sm text-gray-600">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
  React.useEffect(() => {
    console.log('[Widget] WidgetRoot mounted with ID:', sweepstakesId);
    
    // Log widget version on mount
    console.log('[Widget] Widget version:', process.env.VITE_APP_VERSION || 'development');

    // Function to update iframe height
    const updateIframeHeight = () => {
      const height = document.documentElement.scrollHeight;
      console.log('[Widget] Calculating new height:', height);
      
      // Only send message if we're in an iframe
      if (window !== window.parent) {
        try {
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
      console.log('[Widget] Size change detected');
      updateIframeHeight();
    });

    // Observe body for size changes
    observer.observe(document.body);
    console.log('[Widget] ResizeObserver setup complete');

    // Cleanup
    return () => {
      console.log('[Widget] WidgetRoot unmounting');
      observer.disconnect();
    };
  }, [sweepstakesId]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SweepstakesWidget sweepstakesId={sweepstakesId} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Initialize the widget when the script loads
function initializeWidget(sweepstakesId: string) {
  console.log('[Widget] Starting widget initialization with ID:', sweepstakesId);
  
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