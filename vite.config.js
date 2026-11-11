import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "bookmuse-jsx-in-js",
      enforce: "pre",
      async transform(code, id) {
        if (!id.replaceAll("\\", "/").includes("/src/") || !id.endsWith(".js"))
          return null;
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
    },
  },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://localhost:8080" },
  },
  preview: { proxy: { "/api": "http://localhost:8080" } },
});
