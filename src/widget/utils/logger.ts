type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
  groupName?: string;
  collapsed?: boolean;
}

class Logger {
  private prefix = '[Widget]';
  private debugMode: boolean;

  constructor() {
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    return `${this.prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any, options: LogOptions = {}): void {
    if (!this.debugMode && level !== 'error') return;

    const formattedMessage = this.formatMessage(level, message, data);
    
    if (options.groupName) {
      if (options.collapsed) {
        console.groupCollapsed(options.groupName);
      } else {
        console.group(options.groupName);
      }
    }

    switch (level) {
      case 'info':
        console.log(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }

    if (options.groupName) {
      console.groupEnd();
    }
  }

  info(message: string, data?: any, options: LogOptions = {}): void {
    this.log('info', message, data, options);
  }

  warn(message: string, data?: any, options: LogOptions = {}): void {
    this.log('warn', message, data, options);
  }

  error(message: string, error?: any, options: LogOptions = {}): void {
    this.log('error', message, error, options);
  }

  group(name: string, collapsed: boolean = false): void {
    if (this.debugMode) {
      collapsed ? console.groupCollapsed(name) : console.group(name);
    }
  }

  groupEnd(): void {
    if (this.debugMode) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();