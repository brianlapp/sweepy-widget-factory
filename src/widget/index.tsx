import React from 'react';
import ReactDOM from 'react-dom/client';
import { SweepstakesWidget } from '../components/SweepstakesWidget';
import { logger } from './utils/logger';

// Declare the global interface for TypeScript
declare global {
  interface Window {
    initializeWidget: (sweepstakesId: string) => void;
  }
}

export function initializeWidget(sweepstakesId: string) {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SweepstakesWidget sweepstakesId={sweepstakesId} />
    </React.StrictMode>
  );
  
  logger.info(`Widget version ${process.env.VITE_APP_VERSION} mounted`);
}

window.initializeWidget = initializeWidget;