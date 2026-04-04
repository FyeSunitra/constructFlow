import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ["src/components"],  // scan components จาก folder นี้
      dts: "src/components.d.ts", // generate type declarations
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});