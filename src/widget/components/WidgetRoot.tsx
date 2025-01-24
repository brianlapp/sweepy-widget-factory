import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';

interface WidgetRootProps {
  sweepstakesId: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
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

export function WidgetRoot({ sweepstakesId, onReady, onError }: WidgetRootProps) {
  React.useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);
    
    onReady?.();
    
    return () => observer.disconnect();
  }, [onReady]);

  return (
    <ErrorBoundary onError={onError}>
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