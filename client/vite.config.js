import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite Configuration
 * 
 * Παραμετροποίηση του Vite bundler για τη σωστή λειτουργία της εφαρμογής
 * Περιλαμβάνει ρυθμίσεις για development και production mode
 */
export default defineConfig(({ command, mode }) => {
  // Φόρτωση environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  console.log(`Building for ${mode} mode`);
  
  return {
    // Plugins
    plugins: [
      react({
        // Βελτιστοποιήσεις για το React plugin
        jsxRuntime: 'automatic',
        babel: {
          plugins: [
            // Προσθήκη plugin για error handling σε production mode
            isProduction && [
              'transform-remove-console',
              { exclude: ['error', 'warn'] }
            ]
          ].filter(Boolean)
        }
      })
    ],
    
    // Ρυθμίσεις για το build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate chunks for libraries
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
            'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-raw', 'rehype-highlight'],
            'yjs-vendor': ['yjs', 'y-websocket']
          }
        }
      },
      // Εξασφάλιση συμβατότητας με παλαιότερους browsers
      target: 'es2015'
    },
    
    // Development server ρυθμίσεις
    server: {
      port: 3000,
      open: false, // Αυτόματο άνοιγμα του browser
      strictPort: true, // Αποτυχία αν η θύρα δεν είναι διαθέσιμη
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:5001',
          ws: true,
          changeOrigin: true
        },
      },
      // Ορισμός CORS για development
      cors: true
    },
    
    // Επίλυση alias για paths
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils')
      },
      // Αποφυγή διπλών εκδόσεων του React
      dedupe: ['react', 'react-dom', '@chakra-ui/react', 'framer-motion', 'yjs']
    },
    
    // Βελτιστοποιήσεις για το esbuild
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      jsxInject: `import React from 'react'` // Αυτόματο import του React
    },
    
    // Βελτιστοποίηση εξαρτήσεων
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
        'react-icons/fa',
        'react-markdown',
        'remark-gfm',
        'rehype-raw',
        'rehype-highlight',
        'yjs',
        'y-websocket'
      ],
      // Ρύθμιση για σωστή φόρτωση των ESM modules
      esbuildOptions: {
        target: 'es2020'
      }
    },
    
    // Ρυθμίσεις για Preview server (παρόμοιο με το production)
    preview: {
      port: 4173,
      open: false,
      strictPort: true
    }
  };
});