import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Generate a version string based on timestamp
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
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
            return 'widget.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
      // Important: We're now bundling React with our widget
      external: [],
    },
    sourcemap: true,
    minify: mode === 'production',
  },
}));