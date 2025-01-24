interface WidgetConfig {
  containerId: string;
  sweepstakesId: string;
}

class SweepstakesWidget {
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private config: WidgetConfig | null = null;

  init(config: WidgetConfig): void {
    this.config = config;
    this.container = document.getElementById(config.containerId);
    
    if (!this.container) {
      console.error(`Container with ID "${config.containerId}" not found`);
      return;
    }

    this.createIframe();
    this.setupMessageHandlers();
  }

  private createIframe(): void {
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.overflow = 'hidden';
    
    // Set a default height that will be updated once content loads
    this.iframe.style.height = '600px';
    
    if (this.container) {
      this.container.appendChild(this.iframe);
      
      // Initialize the widget content
      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { margin: 0; font-family: system-ui, sans-serif; }
              #root { min-height: 100vh; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              window.SWEEPSTAKES_ID = "${this.config?.sweepstakesId}";
            </script>
            <script type="module" src="/src/widgetEntry.tsx"></script>
          </body>
        </html>
      `;
      
      this.iframe.srcdoc = iframeContent;
    }
  }

  private setupMessageHandlers(): void {
    window.addEventListener('message', (event) => {
      // Only accept messages from our iframe
      if (event.source !== this.iframe?.contentWindow) return;

      switch (event.data.type) {
        case 'setHeight':
          if (this.iframe && typeof event.data.height === 'number') {
            this.iframe.style.height = `${event.data.height}px`;
          }
          break;
          
        case 'error':
          console.error('Widget error:', event.data.error);
          break;
      }
    });
  }
}

// Export the widget instance
const widget = new SweepstakesWidget();
export default widget;

// Make it available globally
(window as any).SweepstakesWidget = widget;