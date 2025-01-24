import React from 'react';
import { WidgetError } from '../types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: WidgetError) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError({
        code: 'RENDER_ERROR',
        message: error.message,
        details: error.stack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error p-4 text-red-500 text-center">
          An error occurred while rendering the widget.
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-xs text-left">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}