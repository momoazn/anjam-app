import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { type PluginOption, defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - run with ANALYZE=true bun run build
    process.env.ANALYZE &&
      (visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // sunburst, treemap, network
      }) as PluginOption),
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    target: "es2020",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "date-fns",
            "date-fns-jalali",
            "react-day-picker",
            "@persian-tools/persian-tools",
          ],
          charts: ["recharts"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "recharts"],
  },
});
