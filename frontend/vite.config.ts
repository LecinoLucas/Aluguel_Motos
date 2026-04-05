import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { createManusDebugCollector } from "../backend/vite.manus-debug-collector";
import { createFrontendManualChunks } from "../backend/vite.manual-chunks";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const BACKEND_ROOT = path.resolve(PROJECT_ROOT, "../backend");
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), createManusDebugCollector(LOG_DIR)];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const backendOrigin = env.VITE_BACKEND_ORIGIN || "http://localhost:3000";

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@shared": path.resolve(BACKEND_ROOT, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname),
    publicDir: path.resolve(import.meta.dirname, "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: createFrontendManualChunks,
        },
      },
    },
    server: {
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
      fs: {
        strict: true,
        allow: [PROJECT_ROOT, BACKEND_ROOT],
        deny: ["**/.*"],
      },
    },
  };
});
