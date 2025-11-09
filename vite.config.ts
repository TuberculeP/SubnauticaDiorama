import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      strict: true
    }
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.glb') || assetInfo.name?.endsWith('.gltf')) {
            return 'assets/models/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  esbuild: {
    supported: {
      'top-level-await': true
    }
  }
})
