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
    host: '0.0.0.0', // Allow access from any IP
    port: 3000,      // Set the port to 3000 or any other desired port
    strictPort: true 
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
