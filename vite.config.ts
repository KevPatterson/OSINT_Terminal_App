import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "components": path.resolve(__dirname, "./src/components"),
      "pages": path.resolve(__dirname, "./src/pages"),
      "styles": path.resolve(__dirname, "./src/styles"),
      "utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: true,
  }
});
