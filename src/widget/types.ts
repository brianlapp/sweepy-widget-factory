export interface WidgetConfig {
  storageUrl: string;
  version: string;
  environment: 'development' | 'production';
}

export interface WidgetMessage {
  type: string;
  payload?: any;
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
  config: WidgetConfig;
  onReady: () => void;
  onError: (error: WidgetError) => void;
}