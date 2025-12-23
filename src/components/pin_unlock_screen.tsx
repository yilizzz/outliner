import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureData } from "../stores/secure_data_store";
import { deriveKey, decryptData, CryptoHelpers } from "../utils/crypto_utils";
import { useAuthStore } from "../stores/auth_store";
import { expiresAbsolute } from "../utils/expires_utils";
import { useLanguage } from "../contexts/language_context";
import { LockKeyhole, Bug } from "lucide-react";
const MAX_PIN_LENGTH = 4;
import Input from "./ui/input";
const PinUnlockScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loadInitialData } = useSecureData();
  const loginWithAuth = useAuthStore.getState().loginWithAuth;
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 状态 1: 输入 PIN
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    const filteredInput = newInput
      .replace(/[^0-9]/g, "")
      .slice(0, MAX_PIN_LENGTH);
    setPin(filteredInput);
    setError(null);

    // 如果 PIN 码输入完整，自动尝试解锁
    if (filteredInput.length === MAX_PIN_LENGTH) {
      handleUnlock(filteredInput);
    }
  };

  // 状态 2: 执行解锁和认证流程
  const handleUnlock = useCallback(
    async (currentPin: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setError(null); // 重置之前的错误

      try {
        // 1. 加载数据阶段
        const storedData = await loadInitialData();
        if (!storedData) {
          // 这种情况通常是本地存储被清空
          throw new Error("DATA_LOST");
        }

        const { salt, encryptedCredsPackage, iterations } = storedData;
        let decryptedCredentials;

        try {
          // 2. 解密阶段
          const saltBuffer = CryptoHelpers.base64UrlToBuffer(salt);
          const derivedKey = await deriveKey(
            currentPin,
            saltBuffer,
            iterations
          );

          const encryptedPackage = JSON.parse(encryptedCredsPackage);
          decryptedCredentials = await decryptData(
            {
              iv: encryptedPackage.iv,
              cipherText: encryptedPackage.cipherText,
            },
            derivedKey
          );
        } catch (cryptoError) {
          // 解密失败通常意味着 PIN 错误
          throw new Error("INVALID_PIN");
        }

        // 3. 准备登录数据
        const { username, password } = decryptedCredentials;
        const email = `${username}@example.com`;

        // 4. 发起请求阶段
        const res = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        // 处理 HTTP 错误状态
        if (!res.ok) {
          throw new Error("SERVER_ERROR");
        }

        const authResponse = await res.json();

        // 安全性校验：确保返回了 token
        if (!authResponse?.data?.access_token) {
          throw new Error("UNEXPECTED_RESPONSE");
        }

        const auth = {
          access_token: authResponse.data.access_token,
          refresh_token: authResponse.data.refresh_token,
          expires: expiresAbsolute(authResponse.data.expires),
        };

        loginWithAuth(auth);
        navigate("/dashboard");
      } catch (e: any) {
        // 5. 精细化错误分发
        console.error("Unlock error:", e);

        switch (e.message) {
          case "DATA_LOST":
            setError(t("error_data_lost")); // 提示数据丢失，建议重新登录
            break;
          case "INVALID_PIN":
            setError(t("pin_incorrect")); // PIN 错误
            setPin(""); // 清空输入框
            break;
          case "AUTH_FAILED":
            setError(t("auth_expired_or_failed")); // 账号或密码已在后端失效
            break;
          case "SERVER_ERROR":
            setError(t("server_connection_error")); // 网络或服务器问题
            break;
          default:
            setError(t("unknown_error")); // 其他未知错误
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, loadInitialData, loginWithAuth, navigate, t]
  );

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-2">
        <span className="text-dark-blue">
          <LockKeyhole size={24} />
        </span>

        <p className="text-gray-500 mb-6">{t("unlock")}</p>

        {error && (
          <div className="p-3 mb-3 text-sm text-dark-red bg-light-red rounded-lg flex gap-2 items-center">
            <Bug /> {error}
          </div>
        )}

        <Input
          type="number"
          value={pin}
          onChange={handlePinChange}
          placeholder={"••••"}
          maxLength={MAX_PIN_LENGTH}
          autoFocus
          disabled={isProcessing}
          className="text-center text-3xl p-4"
        />

        <p className="text-center text-sm text-gray-400 mt-6">
          {isProcessing ? `${t("processing")}` : ""}
        </p>
      </div>
    </div>
  );
};

export default PinUnlockScreen;
