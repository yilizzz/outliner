import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.zhangyili.whatif",
  appName: "WhatIf",
  webDir: "dist",
  server: {
    androidScheme: "https", // 保持 https，确保 Crypto API 可用
  },
  plugins: {
    CapacitorHttp: {
      enabled: true, // 开启此项后，fetch 请求将由原生层执行，绕过混合内容限制
    },
  },
};

export default config;
