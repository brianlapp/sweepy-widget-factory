import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { WidgetConfig, WidgetError } from '../types';

interface WidgetRootProps {
  config: WidgetConfig;
  onReady?: () => void;
  onError?: (error: WidgetError) => void;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: WidgetError) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: WidgetError) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError({
        name: 'RenderError',
        code: 'RENDER_ERROR',
        message: error.message,
        details: error.stack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error">
          An error occurred while rendering the widget.
        </div>
      );
    }
    return this.props.children;
  }
}

export function WidgetRoot({ config, onReady, onError }: WidgetRootProps) {
  React.useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.documentElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary onError={onError}>
      <QueryClientProvider client={queryClient}>
        <SweepstakesWidget 
          sweepstakesId={config.sweepstakesId || ''} 
          onReady={onReady}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}