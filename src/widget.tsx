import React from 'react';
import { createRoot } from 'react-dom/client';
import { SweepstakesWidget } from './components/SweepstakesWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const logger = {
    info: (msg: string, ...args: any[]) => console.log(`[Widget] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[Widget Error] ${msg}`, ...args)
};

function WidgetRoot({ sweepstakesId }: { sweepstakesId: string }) {
    React.useEffect(() => {
        logger.info('Widget mounted with ID:', sweepstakesId);
        
        const updateHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'setHeight', height }, '*');
        };

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
    logger.info('Initializing widget with ID:', sweepstakesId);
    
    try {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        createRoot(root).render(
            <React.StrictMode>
                <WidgetRoot sweepstakesId={sweepstakesId} />
            </React.StrictMode>
        );
        
        window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        logger.info('Widget initialized successfully');
    } catch (error) {
        logger.error('Initialization error:', error);
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