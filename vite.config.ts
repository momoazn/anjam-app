import { readFileSync } from "fs";
import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { type PluginOption, defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const convexUrl = env.VITE_CONVEX_URL;
  const convexSiteUrl =
    env.VITE_CONVEX_SITE_URL ??
    convexUrl?.replace(".convex.cloud", ".convex.site") ??
    "";

  const { version } = JSON.parse(readFileSync("package.json", "utf-8")) as {
    version: string;
  };

  return {
    define: { __APP_VERSION__: JSON.stringify(version) },
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
    server: {
      // Proxy Better Auth HTTP endpoints through Vite so auth cookies can be set for localhost.
      proxy: convexSiteUrl
        ? {
            "/api/auth": {
              target: convexSiteUrl,
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
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
            dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
            icons: [
              "lucide-react",
              "@tabler/icons-react",
              "@phosphor-icons/react",
            ],
            auth: ["better-auth", "@convex-dev/better-auth"],
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
  };
});
