import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // project aliases
      "@": path.resolve(__dirname, "src"),
      "components": path.resolve(__dirname, "src/components")
    },
    // common extensions (optional)
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
  },
  server: {
    // dev server settings — adjust if your backend runs on another hostname
    port: 5173,
    strictPort: false
  },
  define: {
    // if you need to expose env fallbacks in the bundle, add here
  }
});