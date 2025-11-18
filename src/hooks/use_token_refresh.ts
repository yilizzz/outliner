import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/auth_store";
import { expiresAbsolute } from "../utils/expires_utils";
// 预留一些时间用于网络延迟，避免在最后一刻过期
const TOKEN_EXPIRY_THRESHOLD = 2 * 60 * 1000;

export const useTokenRefresh = () => {
  const { auth, isAuthenticated, refreshToken, logout } = useAuthStore();

  const timerRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const checkAndRefreshToken = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !auth) {
      return false; // 未认证，无需刷新
    }

    const absoluteExpiresTime = auth.expires;
    // 如果还有充足时间，则不需要刷新
    if (Date.now() + TOKEN_EXPIRY_THRESHOLD < absoluteExpiresTime) {
      return true; // Token 仍然有效
    }

    // Token 即将或已过期，尝试刷新
    try {
      if (isRefreshingRef.current) return false;
      isRefreshingRef.current = true;
      console.log(
        "Access Token 已过期或临近过期，尝试使用 Refresh Token 刷新..."
      );

      if (!auth.refresh_token) {
        console.error("缺少 Refresh Token，无法自动刷新。");
        logout();
        isRefreshingRef.current = false;
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_DIRECTUS_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: auth.refresh_token,
            mode: "json",
          }),
        }
      );
      const data = await response.json();
      const newAuthResponse = {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        expires: expiresAbsolute(data.data.expires),
      };

      console.log("新 Auth Response:", newAuthResponse);
      refreshToken(newAuthResponse);
      console.log("Token 刷新成功！");

      isRefreshingRef.current = false;
      return true;
    } catch (error) {
      console.error("Token 刷新失败，需要重新 PIN 验证：", error);
      logout();
      isRefreshingRef.current = false;
      return false;
    }
  }, [isAuthenticated, auth, refreshToken, logout]);

  // 根据 auth.expires 安排下一次刷新
  const scheduleRefresh = useCallback(() => {
    clearTimer();
    if (!auth || !isAuthenticated) return;

    const when = auth.expires - Date.now() - TOKEN_EXPIRY_THRESHOLD;
    const ms = Math.max(0, when);

    // 如果已经超时或到点，则立即尝试刷新
    if (ms === 0) {
      // 不 await，避免阻塞调用方；但确保调度下一次刷新由 refresh 成功后的流程触发（store 更新触发本 effect）
      checkAndRefreshToken().then(() => {
        // schedule will be triggered by auth change effect
      });
      return;
    }

    timerRef.current = window.setTimeout(async () => {
      await checkAndRefreshToken();
      // 成功刷新后，auth 在 store 中会更新，触发下面的 effect 来重新 schedule
    }, ms);
  }, [auth, isAuthenticated, checkAndRefreshToken]);

  // 在 auth 变化时（比如登录/刷新/登出）重新安排定时器
  useEffect(() => {
    scheduleRefresh();
    return () => clearTimer();
  }, [auth, isAuthenticated, scheduleRefresh]);

  // 当页面从后台恢复时立即检查（防止 setTimeout 被浏览器节流）
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };
    const onFocus = () => {
      checkAndRefreshToken();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkAndRefreshToken]);

  return { checkAndRefreshToken, scheduleRefresh };
};
