import { WidgetConfig } from '../types';

export class WidgetLoader {
  private iframe: HTMLIFrameElement | null;
  private isReady: boolean;
  private retryCount: number;
  private readonly maxRetries: number;
  private config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.iframe = null;
    this.isReady = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.config = config;
    
    window.addEventListener('message', this.handleMessage.bind(this), false);
    window.addEventListener('error', this.handleError.bind(this), true);
    
    console.log('[Widget] Initialized WidgetLoader with config:', config);
  }

  private handleMessage(event: MessageEvent) {
    const { type, data } = event.data || {};
    if (!type) return;

    console.log('[Widget] Received message:', type, data);
    
    switch(type) {
      case 'WIDGET_ERROR':
        console.error('[Widget] Error from iframe:', data.error);
        this.handleWidgetError(data.error);
        break;
      case 'WIDGET_READY':
        this.isReady = true;
        this.retryCount = 0;
        console.log('[Widget] Ready event received');
        break;
      case 'setHeight':
        if (this.iframe && data?.height) {
          this.iframe.style.height = `${data.height}px`;
        }
        break;
      case 'WIDGET_RETRY':
        this.retryInitialization();
        break;
    }
  }

  private handleError(event: ErrorEvent) {
    console.error('[Widget] Global error:', event.error);
    this.handleWidgetError(event.error);
  }

  private handleWidgetError(error: Error) {
    if (this.retryCount < this.maxRetries) {
      console.log(`[Widget] Attempting retry ${this.retryCount + 1} of ${this.maxRetries}`);
      this.retryInitialization();
    } else {
      console.error('[Widget] Max retries reached, widget failed to initialize');
    }
  }

  private retryInitialization() {
    this.retryCount++;
    console.log(`[Widget] Retrying initialization (${this.retryCount}/${this.maxRetries})`);
    if (this.iframe) {
      const sweepstakesId = this.iframe.getAttribute('data-sweepstakes-id');
      if (sweepstakesId) {
        this.createIframe(sweepstakesId);
      }
    }
  }

  public createIframe(sweepstakesId: string) {
    console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
    
    if (this.iframe) {
      this.iframe.remove();
    }

    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.minHeight = '600px';
    this.iframe.setAttribute('scrolling', 'no');
    this.iframe.setAttribute('title', 'Sweepstakes Widget');
    this.iframe.setAttribute('data-sweepstakes-id', sweepstakesId);
    
    const embedUrl = `${this.config.storageUrl}/embed.html?v=${this.config.version}&t=${Date.now()}`;
    console.log('[Widget] Setting iframe src:', embedUrl);
    this.iframe.src = embedUrl;
    
    this.iframe.onload = () => {
      console.log('[Widget] Iframe loaded, initializing content');
      this.initializeContent(sweepstakesId);
    };
    
    return this.iframe;
  }

  private initializeContent(sweepstakesId: string) {
    if (!this.iframe?.contentWindow) {
      console.error('[Widget] Cannot initialize content - iframe or contentWindow missing');
      return;
    }

    console.log('[Widget] Initializing content with sweepstakes ID:', sweepstakesId);
    this.iframe.contentWindow.postMessage({
      type: 'INITIALIZE_WIDGET',
      sweepstakesId
    }, '*');
  }

  public cleanup() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isReady = false;
    this.retryCount = 0;
    console.log('[Widget] Cleanup completed');
  }
}