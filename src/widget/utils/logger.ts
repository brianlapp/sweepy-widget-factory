type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private prefix = '[Widget]';

  private formatMessage(level: LogLevel, message: string): string {
    return `${this.prefix} [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, ...args: any[]) {
    console.log(this.formatMessage('info', message), ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message: string, error?: Error) {
    console.error(
      this.formatMessage('error', message),
      error ? { message: error.message, stack: error.stack } : ''
    );
  }

  group(label: string) {
    console.group(this.formatMessage('info', label));
  }

  groupEnd() {
    console.groupEnd();
  }
}

export const logger = new Logger();