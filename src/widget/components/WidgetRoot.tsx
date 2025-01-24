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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[Widget Error]', error);
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR', 
      error: { message: error.message } 
    }, '*');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
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
    
    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="widget-container">
          <SweepstakesWidget 
            sweepstakesId={sweepstakesId}
          />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}