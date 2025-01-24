import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/widget',
    lib: {
      entry: path.resolve(__dirname, 'src/widget/index.ts'),
      name: 'SweepstakesWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,
        manualChunks: undefined,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      external: ['react', 'react-dom'],
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});