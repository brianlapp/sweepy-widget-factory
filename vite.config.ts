import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const version = new Date().toISOString().split('T')[0] + '-' + 
               Math.random().toString(36).substring(2, 7);

export default defineConfig(({ mode }) => ({
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'src/widget.tsx'),
      },
      output: {
        // Ensure widget builds as a standalone JS file
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'widget-bundle.js';
          }
          return 'assets/[name]-[hash].js';
        },
        format: 'iife', // Add this to ensure proper browser compatibility
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Ensure widget builds separately from main app
    lib: mode === 'production' ? {
      entry: path.resolve(__dirname, 'src/widget.tsx'),
      name: 'SweepstakesWidget',
      fileName: () => 'widget-bundle.js',
      formats: ['iife'],
    } : undefined,
    sourcemap: true,
    minify: mode === 'production',
  },
}));