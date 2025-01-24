export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[Widget] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[Widget] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[Widget] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Widget] ${message}`, ...args);
    }
  }
};