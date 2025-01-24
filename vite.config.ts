import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from 'vite';

const version = new Date().toISOString().split('T')[0] + '-' + 
               Math.random().toString(36).substring(2, 7);

export default defineConfig(({ mode, command }): UserConfig => {
  const isWidget = process.env.BUILD_TARGET === 'widget';
  
  // Base configuration shared between widget and main app
  const baseConfig = {
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
  };

  // Widget-specific configuration
  if (isWidget) {
    return {
      ...baseConfig,
      build: {
        outDir: 'dist/widget',
        lib: {
          entry: path.resolve(__dirname, 'src/widget.ts'),
          name: 'SweepstakesWidget',
          formats: ['iife'],
          fileName: () => 'widget.js',
        },
        rollupOptions: {
          external: [],
          output: {
            globals: {},
            inlineDynamicImports: true,
          },
        },
        sourcemap: mode === 'development',
        minify: mode === 'production',
      },
    };
  }

  // Main app configuration
  return {
    ...baseConfig,
    server: {
      host: "::",
      port: 8080,
      middlewareMode: false,
    },
    build: {
      outDir: 'dist/app',
      assetsDir: 'assets',
      sourcemap: true,
      minify: mode === 'production',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});