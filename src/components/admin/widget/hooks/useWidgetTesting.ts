import React from 'react';
import { toast } from 'sonner';

interface ErrorLog {
  timestamp: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: any;
}

export function useWidgetTesting() {
  const [testSweepstakesId, setTestSweepstakesId] = React.useState('');
  const [testIframe, setTestIframe] = React.useState<HTMLIFrameElement | null>(null);
  const [errorLogs, setErrorLogs] = React.useState<ErrorLog[]>([]);

  const createTestWidget = () => {
    if (!testSweepstakesId) {
      toast.error('Please select a sweepstakes to test');
      return;
    }

    if (testIframe) {
      testIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';

    const container = document.createElement('div');
    container.id = 'sweepstakes-widget';
    container.setAttribute('data-sweepstakes-id', testSweepstakesId);

    const script = document.createElement('script');
    script.src = `https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js?v=${Date.now()}`;
    
    let testContainer = document.getElementById('widget-test-container');
    if (!testContainer) {
      testContainer = document.createElement('div');
      testContainer.id = 'widget-test-container';
      document.getElementById('widget-test-area')?.appendChild(testContainer);
    }
    
    testContainer.innerHTML = '';
    testContainer.appendChild(container);
    testContainer.appendChild(script);
    
    setTestIframe(iframe);
    
    const handleWidgetMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_ERROR') {
        console.error('Widget Error:', event.data.error);
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.error.message,
          type: 'error',
          details: event.data.error
        }]);
        toast.error(`Widget Error: ${event.data.error.message}`);
      } else if (event.data.type === 'WIDGET_WARNING') {
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.message,
          type: 'warning'
        }]);
      } else if (event.data.type === 'WIDGET_INFO') {
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.message,
          type: 'info'
        }]);
      }
    };

    window.addEventListener('message', handleWidgetMessage);
  };

  return {
    testSweepstakesId,
    setTestSweepstakesId,
    testIframe,
    errorLogs,
    setErrorLogs,
    createTestWidget
  };
}