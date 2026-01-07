import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // 开发模式禁用PWA
      devOptions: {
        enabled: false,
      },
      workbox: {
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/(?:__|\.)/, /\.\w+$/, /^\/admin/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5分钟
              },
            },
          },
        ],
      },
      manifest: {
        name: "What-If: AI Sci-Fi Inspiration & Outlining Tool",
        short_name: "What-If",
        description:
          'Fuel your imagination with AI-analyzed science news. Discover the "What-Ifs" of tomorrow and draft your next masterpiece.',
        theme_color: "#ffffff",
        icons: [
          {
            src: "bean192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "bean512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // 分块策略：将第三方依赖单独打包
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
