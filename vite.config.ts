import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from 'vite';
import fs from 'fs';

const version = new Date().toISOString().split('T')[0] + '-' + 
               Math.random().toString(36).substring(2, 7);

export default defineConfig(({ mode, command }): UserConfig => {
  const isWidget = process.env.BUILD_TARGET === 'widget';
  console.log('[Vite Config] Build target:', process.env.BUILD_TARGET);
  console.log('[Vite Config] Is widget build:', isWidget);
  
  // Base configuration shared between widget and main app
  const baseConfig = {
    plugins: [
      react({
        tsDecorators: true,
        jsxImportSource: "react",
      }),
      mode === 'development' && componentTagger(),
      {
        name: 'log-bundle-size',
        closeBundle: () => {
          if (isWidget && fs.existsSync('dist/widget/widget-bundle.js')) {
            console.log('[Widget Build] Bundle created:', {
              size: fs.statSync('dist/widget/widget-bundle.js').size,
              path: 'dist/widget/widget-bundle.js'
            });
          }
        }
      }
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
    console.log('[Vite Config] Using widget configuration');
    return {
      ...baseConfig,
      build: {
        outDir: 'dist/widget',
        lib: {
          entry: path.resolve(__dirname, 'src/widget/index.tsx'),
          name: 'SweepstakesWidget',
          formats: ['iife'],
          fileName: () => 'widget-bundle.js',
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            },
            inlineDynamicImports: true,
          },
        },
        sourcemap: mode === 'development',
        minify: mode === 'production',
        target: 'es2015',
        cssCodeSplit: false,
      },
    };
  }

  // Main app configuration
  console.log('[Vite Config] Using main app configuration');
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