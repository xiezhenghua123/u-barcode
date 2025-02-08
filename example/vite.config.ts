import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  // 别名
  resolve: {
    alias: {
      "@root": path.resolve(__dirname, '../'),
    },
  },
});
