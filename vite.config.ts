import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from 'vite';
import fs from 'fs';

const version = new Date().toISOString().split('T')[0] + '-' + 
               Math.random().toString(36).substring(2, 7);

export default ({ mode }: { mode: string }): UserConfig => {
  const isWidget = process.env.BUILD_TARGET === 'widget';
  
  console.log('[Vite Config] Building for:', { mode, isWidget, version });

  return {
    plugins: [
      react({
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
    },
    server: {
      host: "::",
      port: 8080,
      middlewareMode: false,
    },
    build: isWidget ? {
      outDir: 'dist/widget',
      emptyOutDir: true,
      lib: {
        entry: path.resolve(__dirname, 'src/widget/index.tsx'),
        name: 'SweepstakesWidget',
        formats: ['iife'],
        fileName: () => 'widget-bundle.js'
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
          inlineDynamicImports: true
        }
      }
    } : {
      outDir: 'dist/app',
      sourcemap: true
    },
    base: isWidget ? './' : '/',
    define: {
      'process.env.VITE_APP_VERSION': JSON.stringify(version)
    }
  };
};