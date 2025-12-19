import { create } from "zustand";
import { SecureStorage, SECURE_KEYS } from "../utils/storage_utils";

type LoadedInitialData = {
  salt: string;
  encryptedCredsPackage: string;
  iterations: number;
} | null;

interface SecureDataState {
  isInitialized: boolean | null;
  isLoading: boolean;
  saveInitialData: (salt: string, encryptedCreds: string) => Promise<void>;
  loadInitialData: () => Promise<LoadedInitialData>;
  // (可选) 手动触发初始化检查
  //checkInitialization: () => Promise<void>;
}

export const useSecureData = create<SecureDataState>((set, get) => {
  // 异步初始化检查（在 store 创建时触发）
  (async () => {
    set({ isLoading: true });
    try {
      const initialized = await SecureStorage.getItem(
        SECURE_KEYS.IS_INITIALIZED
      );
      set({
        isInitialized: initialized === "true",
        isLoading: false,
      });
    } catch (e) {
      set({ isInitialized: false, isLoading: false });
    }
  })();

  return {
    isInitialized: null,
    isLoading: true,

    // checkInitialization: async () => {
    //   set({ isLoading: true });
    //   try {
    //     const initialized = await SecureStorage.getItem(
    //       SECURE_KEYS.IS_INITIALIZED
    //     );
    //     set({
    //       isInitialized: initialized === "true",
    //       isLoading: false,
    //     });
    //   } catch (e) {
    //     set({ isInitialized: false, isLoading: false });
    //   }
    // },

    saveInitialData: async (salt: string, encryptedCreds: string) => {
      // 存储 salt, enc_creds, initialized；并尝试从 encryptedCreds 中提取 iterations 写入 app_iterations（向后兼容）
      await SecureStorage.setItem(SECURE_KEYS.PIN_SALT, salt);
      await SecureStorage.setItem(SECURE_KEYS.ENC_CREDS, encryptedCreds);
      // 尝试解析 iterations（如果传入的 encryptedCredsJSON 包含 iterations 字段）
      try {
        const parsed = JSON.parse(encryptedCreds);
        if (parsed && typeof parsed.iterations !== "undefined") {
          await SecureStorage.setItem(
            SECURE_KEYS.PIN_ITERATIONS,
            String(parsed.iterations)
          );
        }
      } catch (e) {
        // 如果不是 JSON 或没有 iterations，忽略
      }
      await SecureStorage.setItem(SECURE_KEYS.IS_INITIALIZED, "true");
      set({ isInitialized: true });
    },

    loadInitialData: async () => {
      const salt = await SecureStorage.getItem(SECURE_KEYS.PIN_SALT);
      const encryptedCredsPackage = await SecureStorage.getItem(
        SECURE_KEYS.ENC_CREDS
      );
      let iterationsStr = await SecureStorage.getItem(
        SECURE_KEYS.PIN_ITERATIONS
      );

      if (!salt || !encryptedCredsPackage) {
        return null;
      }

      // 如果没有单独存储 iterations，则尝试从 encryptedCredsPackage 中解析
      if (!iterationsStr) {
        try {
          const parsed = JSON.parse(encryptedCredsPackage);
          if (parsed && typeof parsed.iterations !== "undefined") {
            iterationsStr = String(parsed.iterations);
          }
        } catch (e) {
          // ignore
        }
      }

      const iterations = iterationsStr ? parseInt(iterationsStr, 10) : NaN;
      if (Number.isNaN(iterations)) {
        // 如果无法确定 iterations，则返回 null（调用方可自行处理）
        return null;
      }

      return {
        salt,
        encryptedCredsPackage,
        iterations,
      };
    },
  };
});
