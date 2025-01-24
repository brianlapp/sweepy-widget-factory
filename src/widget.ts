interface WidgetConfig {
  containerId: string;
  sweepstakesId: string;
}

class SweepstakesWidget {
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private config: WidgetConfig | null = null;
  private version = process.env.VITE_APP_VERSION || '1.0.0';

  init(config: WidgetConfig): void {
    console.log('[Widget] Initializing with config:', config);
    this.config = config;
    this.container = document.getElementById(config.containerId);
    
    if (!this.container) {
      console.error(`[Widget] Container with ID "${config.containerId}" not found`);
      return;
    }

    this.createIframe();
    this.setupMessageHandlers();
  }

  private createIframe(): void {
    if (!this.container || !this.config) return;

    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.minHeight = '600px';
    this.iframe.setAttribute('scrolling', 'no');
    this.iframe.setAttribute('title', 'Sweepstakes Widget');
    
    const storageUrl = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
    const embedUrl = `${storageUrl}/embed.html?v=${this.version}&t=${Date.now()}`;
    this.iframe.src = embedUrl;
    
    this.container.appendChild(this.iframe);
    
    this.iframe.onload = () => {
      console.log('[Widget] Iframe loaded, initializing content');
      this.initializeContent();
    };
  }

  private initializeContent(): void {
    if (!this.iframe?.contentWindow || !this.config) {
      console.error('[Widget] Cannot initialize content - iframe or config missing');
      return;
    }

    this.iframe.contentWindow.postMessage({
      type: 'INITIALIZE_WIDGET',
      sweepstakesId: this.config.sweepstakesId
    }, '*');
  }

  private setupMessageHandlers(): void {
    window.addEventListener('message', (event) => {
      if (!event.data?.type) return;

      console.log('[Widget] Received message:', event.data);

      switch (event.data.type) {
        case 'setHeight':
          if (this.iframe && typeof event.data.height === 'number') {
            this.iframe.style.height = `${event.data.height}px`;
          }
          break;
          
        case 'WIDGET_ERROR':
          console.error('[Widget] Error from iframe:', event.data.error);
          break;
          
        case 'WIDGET_READY':
          console.log('[Widget] Widget reported ready');
          break;
      }
    });
  }
}

const widget = new SweepstakesWidget();
export default widget;

// Make it available globally
(window as any).SweepstakesWidget = widget;