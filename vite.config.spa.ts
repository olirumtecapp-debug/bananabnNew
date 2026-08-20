import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/react-router": path.resolve(__dirname, "./src/mock-router.tsx"),
      "@tanstack/react-start": path.resolve(__dirname, "./src/mock-react-start.ts"),
    },
  },
  build: {
    outDir: "dist-spa",
    emptyOutDir: true,
  },
});
