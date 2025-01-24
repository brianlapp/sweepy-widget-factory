export interface WidgetConfig {
  storageUrl: string;
  version: string;
  environment: 'development' | 'production';
}

export interface WidgetMessage {
  type: string;
  data?: any;
}

export interface WidgetError {
  code: string;
  message: string;
  details?: any;
  context?: Error;
}

export interface WidgetState {
  isReady: boolean;
  isLoading: boolean;
  error: WidgetError | null;
}

export interface WidgetProps {
  sweepstakesId: string;
  config: WidgetConfig;
}