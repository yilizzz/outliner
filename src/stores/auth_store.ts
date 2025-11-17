import { create } from "zustand";
import {
  SecureStorage,
  AUTH_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../utils/storage_utils";
import { directus } from "../lib/directus";
interface DirectusAuthResponse {
  access_token: string;
  expires: number;
  refresh_token?: string;
}

interface AuthState {
  userId: string | null;
  auth: DirectusAuthResponse | null;
  isAuthenticated: boolean;
  saveUserIdToStorage: (userId: string | null) => Promise<void>;
  loginWithAuth: (
    auth: Omit<DirectusAuthResponse, "expires"> & { expires: number }
  ) => void;
  logout: () => void;
  refreshToken: (newAuth: DirectusAuthResponse) => void;
}
const saveUserIdToStorage = async (userId: string | null) => {
  try {
    if (!userId) {
      SecureStorage.removeItem(USER_STORAGE_KEY);
    } else {
      SecureStorage.setItem(USER_STORAGE_KEY, userId);
    }
  } catch (e) {
    console.log("saveUserIdToStorage error", e);
  }
};

const saveAuthToStorage = async (auth: DirectusAuthResponse | null) => {
  try {
    if (!auth) {
      SecureStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      SecureStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    }
  } catch (e) {
    console.log("saveAuthToStorage error", e);
  }
};
const loadAuthFromStorage = async (): Promise<DirectusAuthResponse | null> => {
  try {
    const raw = await SecureStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DirectusAuthResponse;
    if (!parsed || !parsed.access_token) return null;
    if (parsed.expires && parsed.expires < Date.now()) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.log("loadAuthFromStorage error", e);
    return null;
  }
};
const loadUserIdFromStorage = async (): Promise<string | null> => {
  try {
    const raw = await SecureStorage.getItem(USER_STORAGE_KEY);
    return raw || null;
  } catch (e) {
    console.log("loadUserIdFromStorage error", e);
    return null;
  }
};
export const useAuthStore = create<AuthState>((set, get) => {
  // start with a synchronous empty state, then load async value and update
  const initialAuth: DirectusAuthResponse | null = null;
  (async () => {
    try {
      const [stored, storedUserId] = await Promise.all([
        loadAuthFromStorage(),
        loadUserIdFromStorage(),
      ]);
      if (stored?.access_token) {
        await directus.setToken(stored.access_token);
      } else {
        await directus.setToken(null);
      }
      set({
        auth: stored,
        isAuthenticated: Boolean(stored),
        userId: storedUserId,
      });
    } catch (e) {
      console.error("Failed to restore auth state", e);
    }
  })();

  return {
    auth: initialAuth,
    isAuthenticated: false,
    userId: null,
    saveUserIdToStorage: async (userId) => {
      saveUserIdToStorage(userId);
      set({ userId });
    },
    loginWithAuth: async (auth) => {
      saveAuthToStorage(auth);
      await directus.setToken(auth.access_token);
      set({
        auth: auth,
        isAuthenticated: true,
      });
    },

    refreshToken: async (newAuth) => {
      saveAuthToStorage(newAuth);
      await directus.setToken(newAuth.access_token);
      set({
        auth: newAuth,
        isAuthenticated: true,
      });
    },

    logout: async () => {
      saveAuthToStorage(null);
      directus.setToken(null);
      set({
        auth: null,
        isAuthenticated: false,
      });
    },
  };
});
