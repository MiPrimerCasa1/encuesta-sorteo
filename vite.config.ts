import { defineConfig } from "vite";

export default defineConfig({
  base: "/encuesta-mi-primera-casa/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
