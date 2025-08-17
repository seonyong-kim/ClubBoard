import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080", // ← 백엔드 포트와 맞추기 (localhost 대신 127.0.0.1 권장)
        changeOrigin: true,
        secure: false,
        // pathRewrite가 필요 없다면 생략. 프론트에서 /api로 호출하면 그대로 /api로 전달
        // rewrite: (path) => path,
      },
    },
    // 네트워크 바인드가 필요하면 다음을 켜세요 (옵션)
    // host: true,
  },
});
