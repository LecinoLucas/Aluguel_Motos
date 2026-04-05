import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { createManusDebugCollector } from "./vite.manus-debug-collector";
import { createFrontendManualChunks } from "./vite.manual-chunks";

const BACKEND_ROOT = import.meta.dirname;
const FRONTEND_ROOT = path.resolve(BACKEND_ROOT, "../frontend");
export const frontendAppRoot = FRONTEND_ROOT;
const frontendPublicRoot = path.join(frontendAppRoot, "public");
const sharedRoot = path.join(BACKEND_ROOT, "shared");
const LOG_DIR = path.join(FRONTEND_ROOT, ".manus-logs");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    jsxLocPlugin(),
    vitePluginManusRuntime(),
    createManusDebugCollector(LOG_DIR),
  ],
  resolve: {
    alias: {
      "@": path.join(frontendAppRoot, "src"),
      "@shared": sharedRoot,
      "@assets": path.join(FRONTEND_ROOT, "attached_assets"),
    },
  },
  envDir: BACKEND_ROOT,
  root: frontendAppRoot,
  publicDir: frontendPublicRoot,
  build: {
    outDir: path.join(BACKEND_ROOT, "dist/public"),
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
    fs: {
      strict: true,
      allow: [FRONTEND_ROOT, BACKEND_ROOT],
      deny: ["**/.*"],
    },
  },
});