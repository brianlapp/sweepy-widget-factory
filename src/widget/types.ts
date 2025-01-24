export interface WidgetConfig {
  storageUrl: string;
  version: string;
}

export interface WidgetMessage {
  type: string;
  data?: any;
}

export interface WidgetError {
  code: string;
  message: string;
  details?: any;
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