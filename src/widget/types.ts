export interface WidgetConfig {
  sweepstakesId: string;
  version?: string;
  environment?: 'development' | 'production';
}

export interface WidgetMessage {
  type: string;
  data?: any;
  error?: Error;
}

export interface WidgetError extends Error {
  code?: string;
  context?: any;
}

export interface WidgetState {
  isReady: boolean;
  hasError: boolean;
  error?: WidgetError;
  height?: number;
}