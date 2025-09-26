// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // everything below hits your Node server on 5000 in dev
      "/api": { target: "http://127.0.0.1:5000", changeOrigin: true },
      "/rpc": { target: "http://127.0.0.1:5000", changeOrigin: true },
      "/tx":  { target: "http://127.0.0.1:5000", changeOrigin: true },
    },
  },
  plugins: [react(), nodePolyfills(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  optimizeDeps: { esbuildOptions: { define: { global: "globalThis" } } },
}));
