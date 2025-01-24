import { createRoot } from 'react-dom/client';
import { WidgetRoot } from './components/WidgetRoot';

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[Widget] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => {
    console.error(`[Widget Error] ${msg}`, ...args);
    window.parent.postMessage({ 
      type: 'WIDGET_ERROR', 
      error: { message: msg, details: args[0] } 
    }, '*');
  }
};

export function initializeWidget(sweepstakesId: string) {
  logger.info('Initializing widget with ID:', sweepstakesId);
  
  try {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    createRoot(root).render(
      <WidgetRoot sweepstakesId={sweepstakesId} />
    );
    
    logger.info('Widget initialized successfully');
  } catch (error) {
    logger.error('Initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}