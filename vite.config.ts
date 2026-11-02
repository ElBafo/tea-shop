import { defineConfig } from "vite";
import { buildOffline } from "./scripts/build-offline.mjs";

let offlineConfig = {outDir: "dist", base: "/tea-shop/"};

export default defineConfig({
  base: "/tea-shop/",
  plugins: [{
    name: "tea-shop-offline-shell",
    apply: "build",
    configResolved(config) { offlineConfig = {outDir: config.build.outDir, base: config.base}; },
    async closeBundle() {
      const config = offlineConfig;
      await buildOffline(config.outDir, config.base);
    },
  }],
});
