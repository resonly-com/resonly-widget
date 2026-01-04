import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite configuration for building the widget loader
 *
 * Outputs:
 * - dist/widget.js (IIFE for CDN usage)
 * - dist/widget.mjs (ESM for module usage)
 */
export default defineConfig({
  build: {
    // Library mode
    lib: {
      entry: resolve(__dirname, 'src/widget-loader.ts'),
      name: 'ResonlyWidget',
      formats: ['iife', 'es'],
      fileName: (format) => {
        if (format === 'iife') return 'widget.js';
        if (format === 'es') return 'widget.mjs';
        return `widget.${format}.js`;
      },
    },

    // Optimize for size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: [], // Remove specific functions if needed
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // Output options
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,

    // Rollup options
    rollupOptions: {
      output: {
        // Ensure globals are properly set for IIFE
        globals: {},
        // Optimize chunk size
        manualChunks: undefined,
      },
    },

    // Target modern browsers (smaller output)
    target: 'es2018',

    // CSS code splitting (not used in this case, but good to have)
    cssCodeSplit: false,
  },

  // Development server (for testing)
  server: {
    port: 3000,
    open: '/demo.html',
  },

  // Preview server (for testing built output)
  preview: {
    port: 3001,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // TypeScript configuration
  esbuild: {
    treeShaking: true,
  },
});
