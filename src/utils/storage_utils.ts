import { Preferences } from "@capacitor/preferences";

export const SECURE_KEYS = {
  PIN_SALT: "pin_salt",
  PIN_ITERATIONS: "pin_iterations",
  ENC_CREDS: "enc_creds",
  IS_INITIALIZED: "initialized",
  APP_LANGUAGE: "app_language",
} as const;

export const AUTH_STORAGE_KEY = "app_auth_v1";
export const USER_STORAGE_KEY = "app_user_id";
interface SecureStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const SecureStorage: SecureStorage = {
  getItem: async function (key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: key });
    return value;
  },
  setItem: async function (key: string, value: string): Promise<void> {
    await Preferences.set({
      key: key,
      value: value,
    });
  },
  removeItem: async function (key: string): Promise<void> {
    await Preferences.remove({ key: key });
  },
};
