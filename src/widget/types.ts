// Widget Configuration Types
export interface WidgetConfig {
  storageUrl: string;
  version: string;
  sweepstakesId?: string;
}

export interface WidgetTestConfig {
  containerId: string;
  sweepstakesId: string;
}

// Widget State and Status Types
export interface WidgetState {
  isLoading: boolean;
  error: WidgetError | null;
}

export type WidgetStatus = 'initializing' | 'ready' | 'error' | 'loading';

// Error Handling Types
export interface WidgetError {
  code: string;
  message: string;
  details?: unknown;
}

// Message Types
export interface WidgetMessage {
  type: string;
  error?: WidgetError;
  height?: number;
}

// Event Types
export interface WidgetEvent {
  type: string;
  data?: any;
}