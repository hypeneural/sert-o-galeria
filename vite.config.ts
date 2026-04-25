import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ command, mode }) => {
  // Load VITE_* env vars
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,

    plugins: [
      tailwindcss(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart(),
      react(),
      // Cloudflare Workers plugin — only during build
      ...(command === "build" ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    ],

    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-start",
        "@tanstack/react-query",
      ],
    },

    server: {
      port: 8080,
      strictPort: false,
      host: true,
    },

    build: {
      // Output for static hosting
      outDir: "dist",
    },
  };
});
