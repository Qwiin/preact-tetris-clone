import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path';
import copy from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@css': path.resolve(__dirname, './src/css'),
      '@fonts': path.resolve(__dirname, './src/font'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@sounds': path.resolve(__dirname, './src/assets/sounds')
    },
  },
  plugins: [
    preact(),
    copy({flatten: false,
      targets: [
        { src: "src/**/*.(html|svg|png|webp|jpg|gif|json|mp3|eot|ttf|woff)", dest: "dist" }
      ],
    })
  ],
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
