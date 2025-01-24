import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from 'vite';

const version = new Date().toISOString().split('T')[0] + '-' + 
               Math.random().toString(36).substring(2, 7);

export default defineConfig(({ mode }): UserConfig => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react({
      tsDecorators: true,
      jsxImportSource: "react",
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: mode === 'production',
    rollupOptions: {
      input: mode === 'production' 
        ? path.resolve(__dirname, 'src/widget.ts')
        : {
            main: path.resolve(__dirname, 'index.html'),
            widget: path.resolve(__dirname, 'src/widget.ts')
          },
      output: {
        format: 'iife',
        name: 'SweepstakesWidget',
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'widget.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
}));