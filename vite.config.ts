import react from "@vitejs/plugin-react";
import { vavite } from "vavite";
import ssr from "vike/plugin";
import { defineConfig } from "vite";
import { telefunc } from "telefunc/vite";

export default defineConfig({
  server: {
    port: Number(process.env.PORT),
    host: true,
  },
  resolve: {
    alias: {
      "#root": __dirname,
    },
  },
  plugins: [
    vavite({
      serverEntry: "server.ts",
      serveClientAssetsInDev: true,
      reloadOn: "static-deps-change",
    }),
    react(),
    ssr({ disableAutoFullBuild: true }),
    telefunc(),
  ],
});
