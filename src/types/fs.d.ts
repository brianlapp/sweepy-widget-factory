interface FileSystemAPI {
  readFile(path: string, options?: { encoding?: string }): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

declare global {
  interface Window {
    fs: FileSystemAPI;
  }
}

export {};