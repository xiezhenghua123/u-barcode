import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";


// 检测当前平台
console.log(`当前运行平台: ${process.env.UNI_PLATFORM || 'h5'}`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],
});
