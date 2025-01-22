import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: mode === 'development' ? 'public' : 'dist',
    assetsDir: '',  // Changed to empty string to put assets in root
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'src/widget.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'widget.bundle.js';
          }
          return mode === 'development' ? '[name].js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: mode === 'development' ? '[name][extname]' : 'assets/[name]-[hash][extname]',
        chunkFileNames: mode === 'development' ? '[name].js' : 'assets/[name]-[hash].js',
        manualChunks: undefined,
        inlineDynamicImports: false,
      },
    },
    sourcemap: mode === 'development',
    minify: mode !== 'development',
    target: 'es2015',
  },
}));