import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  build: {
    target: "es2020",
    cssMinify: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
