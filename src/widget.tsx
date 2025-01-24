import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const logger = {
    info: (msg: string, ...args: any[]) => console.log(`[Widget] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[Widget Error] ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.debug(`[Widget Debug] ${msg}`, ...args)
};

function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
    React.useEffect(() => {
        logger.info('Widget mounted with ID:', sweepstakesId);
        
        const updateHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'setHeight', height }, '*');
            logger.debug('Height updated:', height);
        };

        // Track React availability
        (window as any).__WIDGET_STATE__.reactLoaded = true;
        logger.info('React loaded and available');
        window.parent.postMessage({ type: 'REACT_LOADED', status: true }, '*');

        const observer = new ResizeObserver(updateHeight);
        observer.observe(document.body);
        
        return () => observer.disconnect();
    }, [sweepstakesId]);

    return (
        <QueryClientProvider client={queryClient}>
            <SweepstakesWidget sweepstakesId={sweepstakesId} />
        </QueryClientProvider>
    );
}

function initializeWidget(sweepstakesId: string) {
    logger.info('Starting widget initialization with ID:', sweepstakesId);
    
    try {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        logger.debug('Creating React root element');
        createRoot(root).render(
            <React.StrictMode>
                <WidgetRoot sweepstakesId={sweepstakesId} />
            </React.StrictMode>
        );
        
        logger.info('Widget initialization completed');
        window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
    } catch (error) {
        logger.error('Initialization error:', error);
        window.parent.postMessage({ 
            type: 'WIDGET_ERROR', 
            error: { 
                message: 'Initialization failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            } 
        }, '*');
        throw error; // Re-throw to trigger error boundary
    }
}

// Export for use in iframe
(window as any).initializeWidget = initializeWidget;