import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // MÁGICO: Força caminhos relativos para o WebView do Android encontrar os ficheiros
  base: "./", 

  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Garante que a pasta dist é limpa antes de cada build
    sourcemap: false,
    rollupOptions: {
      output: {
        // O [hash] garante que o Android percebe que o ficheiro mudou e ignora a cache
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  server: {
    port: 5173,
    host: true,
  },
});