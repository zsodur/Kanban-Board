import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ==============================================================================
//  Vite 配置 - 开发服务器与代理
// ==============================================================================
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://backend:8000",
        ws: true,
      },
    },
  },
});
