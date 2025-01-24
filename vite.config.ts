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
      jsxImportSource: "react", // Explicitly set React as JSX source
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Ensure single copy of React
  },
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'src/widget.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'widget-bundle.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'], // Bundle React separately
        },
      },
      external: [], // Bundle everything together
    },
    sourcemap: true,
    minify: mode === 'production',
  },
}));