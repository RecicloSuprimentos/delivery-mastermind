import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/rest': {
        target: 'https://supabase.mgbase.com.br',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://supabase.mgbase.com.br',
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://supabase.mgbase.com.br',
        changeOrigin: true,
        secure: true,
      },
      '/realtime': {
        target: 'https://supabase.mgbase.com.br',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
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
}));
