import { WidgetConfig, WidgetError } from '../types';
import { logger } from '../utils/logger';

export class WidgetLoader {
  private iframe: HTMLIFrameElement | null;
  private config: WidgetConfig;
  private retryAttempts: number;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(config: WidgetConfig) {
    this.iframe = null;
    this.config = config;
    this.retryAttempts = 0;
    
    window.addEventListener('message', this.handleMessage.bind(this));
    window.addEventListener('error', this.handleError.bind(this));
    
    logger.info('WidgetLoader initialized with config:', config);
  }

  public createIframe(sweepstakesId: string): HTMLIFrameElement {
    logger.info('Creating iframe for sweepstakes:', sweepstakesId);
    
    if (this.iframe) {
      this.iframe.remove();
    }

    this.iframe = document.createElement('iframe');
    this.setupIframe(this.iframe, sweepstakesId);
    
    return this.iframe;
  }

  private setupIframe(iframe: HTMLIFrameElement, sweepstakesId: string): void {
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('title', 'Sweepstakes Widget');
    iframe.setAttribute('data-sweepstakes-id', sweepstakesId);
    
    const embedUrl = this.getEmbedUrl();
    iframe.src = embedUrl;
    
    iframe.onload = () => this.initializeContent(sweepstakesId);
  }

  private getEmbedUrl(): string {
    const baseUrl = this.config.storageUrl;
    const version = this.config.version;
    const timestamp = Date.now();
    return `${baseUrl}/embed.html?v=${version}&t=${timestamp}`;
  }

  private initializeContent(sweepstakesId: string): void {
    if (!this.iframe?.contentWindow) {
      logger.error('Cannot initialize content - iframe or contentWindow missing');
      return;
    }

    logger.info('Initializing content with sweepstakes ID:', sweepstakesId);
    this.iframe.contentWindow.postMessage({
      type: 'INITIALIZE_WIDGET',
      sweepstakesId
    }, '*');
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data || {};
    if (!type) return;

    logger.info('Received message:', { type, data });
    
    switch(type) {
      case 'WIDGET_ERROR':
        this.handleWidgetError(data.error);
        break;
      case 'WIDGET_READY':
        this.retryAttempts = 0;
        logger.info('Widget ready');
        break;
      case 'setHeight':
        this.updateIframeHeight(data?.height);
        break;
    }
  }

  private handleError(event: ErrorEvent): void {
    logger.error('Global error:', event.error);
    this.handleWidgetError({
      code: 'GLOBAL_ERROR',
      message: event.message,
      details: event.error
    });
  }

  private handleWidgetError(error: WidgetError): void {
    logger.error('Widget error:', error);
    
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      logger.info(`Retrying initialization (${this.retryAttempts}/${this.maxRetries})`);
      setTimeout(() => this.retryInitialization(), this.retryDelay);
    } else {
      logger.error('Max retries reached, widget failed to initialize');
    }
  }

  private retryInitialization(): void {
    if (this.iframe) {
      const sweepstakesId = this.iframe.getAttribute('data-sweepstakes-id');
      if (sweepstakesId) {
        this.createIframe(sweepstakesId);
      }
    }
  }

  private updateIframeHeight(height?: number): void {
    if (this.iframe && height) {
      this.iframe.style.height = `${height}px`;
    }
  }

  public cleanup(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.retryAttempts = 0;
    window.removeEventListener('message', this.handleMessage.bind(this));
    window.removeEventListener('error', this.handleError.bind(this));
    logger.info('Widget cleanup completed');
  }
}