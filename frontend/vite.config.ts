// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false, // si el backend usa HTTPS, ponlo en true
        ws: false, // para mantener la conexión abierta
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
