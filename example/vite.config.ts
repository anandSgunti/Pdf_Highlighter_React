import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Pdf_Highlighter_React/example-app/",
  build: {
    target: "esnext",
    outDir: "example-app",
  },
  plugins: [reactRefresh()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.entry': require.resolve('pdfjs-dist/build/pdf.worker.entry'),
    },
  },
  
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
