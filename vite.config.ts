import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => {
  // Load VITE_* env vars
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,

    plugins: [
      TanStackRouterVite({ quoteStyle: "double" }),
      tailwindcss(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      react(),
    ],

    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
    },

    server: {
      port: 8080,
      strictPort: false,
      host: true,
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-dom") || id.includes("/react/")) return "vendor";
              if (id.includes("@tanstack")) return "router";
              if (id.includes("framer-motion")) return "motion";
            }
          },
        },
      },
    },
  };
});
