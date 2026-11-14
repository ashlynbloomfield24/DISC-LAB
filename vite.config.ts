import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps asset paths relative so the build works on GitHub Pages
// under any repository name (e.g. https://<user>.github.io/DISC-LAB/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      // Keep the large charting library in its own cached chunk.
      output: { manualChunks: { recharts: ['recharts'], react: ['react', 'react-dom'] } },
    },
    // Recharts alone is ~550 kB minified (~150 kB gzipped); it is split into its own cached chunk.
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
  },
});
