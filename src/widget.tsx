import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Storage URL for origin checking
const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';

// Enhanced logging utility
const logger = {
    timeStart: Date.now(),
    formatTime: () => `[${new Date().toISOString()}]`,
    info: (msg: string, ...args: any[]) => console.log(`${logger.formatTime()} [Widget] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`${logger.formatTime()} [Widget] Error: ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`${logger.formatTime()} [Widget] Warning: ${msg}`, ...args),
    performance: (name: string) => {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`widget-${name}`);
            logger.info(`Performance mark: ${name}`);
        }
    }
};

// Enhanced Error Boundary Component with detailed error reporting
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
        logger.info('ErrorBoundary initialized');
    }

    static getDerivedStateFromError(error: Error) {
        logger.error('Error caught in boundary:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        logger.error('Error details:', { error, errorInfo });
        
        // Send detailed error to parent window
        if (window !== window.parent) {
            try {
                const storageOrigin = new URL(STORAGE_URL).origin;
                window.parent.postMessage({
                    type: 'WIDGET_ERROR',
                    error: {
                        message: error.message,
                        stack: error.stack,
                        componentStack: errorInfo.componentStack,
                        timestamp: new Date().toISOString()
                    }
                }, storageOrigin);
            } catch (e) {
                logger.error('Error sending error message to parent:', e);
            }
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                                Technical Details
                            </summary>
                            <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
                                {this.state.error?.stack}\n\nComponent Stack:{this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
    React.useEffect(() => {
        logger.info('WidgetRoot mounted with ID:', sweepstakesId);
        logger.performance('widget-mount');
        
        // Log widget version on mount
        logger.info('Widget version:', process.env.VITE_APP_VERSION || 'development');

        // Enhanced height update function with logging
        const updateIframeHeight = () => {
            const height = document.documentElement.scrollHeight;
            logger.info('Calculating new height:', height);
            
            // Only send message if we're in an iframe
            if (window !== window.parent) {
                try {
                    const storageOrigin = new URL(STORAGE_URL).origin;
                    window.parent.postMessage({ 
                        type: 'setHeight', 
                        height,
                        timestamp: Date.now()
                    }, storageOrigin);
                    logger.info('Sent height update:', height, 'to origin:', storageOrigin);
                } catch (error) {
                    logger.error('Error sending height update:', error);
                }
            }
        };

        // Set up height observer with logging
        const observer = new ResizeObserver(() => {
            logger.info('Size change detected');
            logger.performance('height-update-start');
            updateIframeHeight();
            logger.performance('height-update-end');
        });

        // Observe body for size changes
        observer.observe(document.body);
        logger.info('ResizeObserver setup complete');

        // Cleanup with logging
        return () => {
            logger.info('WidgetRoot unmounting');
            logger.performance('widget-unmount');
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

// Initialize the widget with enhanced error handling
function initializeWidget(sweepstakesId: string) {
    logger.info('Starting widget initialization with ID:', sweepstakesId);
    logger.performance('init-start');
    
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

        logger.info('Creating widget with sweepstakes ID:', sweepstakesId);
        logger.performance('react-render-start');
        
        createRoot(root).render(
            <React.StrictMode>
                <WidgetRoot sweepstakesId={sweepstakesId} />
            </React.StrictMode>
        );
        
        logger.info('Widget initialized successfully');
        logger.performance('init-complete');
    } catch (error) {
        logger.error('Initialization error:', error);
        logger.performance('init-error');
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `
                <div class="p-6 bg-white rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold text-red-600 mb-2">
                        Widget Initialization Error
                    </h2>
                    <p class="text-gray-600">
                        ${error instanceof Error ? error.message : 'Unable to load sweepstakes widget'}
                    </p>
                </div>
            `;
        }
    }
}

// Export for use in iframe
(window as any).initializeWidget = initializeWidget;
