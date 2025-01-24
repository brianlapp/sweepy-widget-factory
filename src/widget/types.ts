export interface WidgetConfig {
  storageUrl: string;
  version: string;
  sweepstakesId?: string;
}

export interface WidgetState {
  isLoading: boolean;
  error: WidgetError | null;
}

export interface WidgetError {
  code: string;
  message: string;
  details?: string;
}

export interface WidgetMessage {
  type: string;
  error?: WidgetError;
  height?: number;
}

export interface WidgetTestConfig {
  containerId: string;
  sweepstakesId: string;
}