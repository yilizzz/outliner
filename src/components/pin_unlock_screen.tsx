import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureData } from "../stores/secure_data_store";
import { deriveKey, decryptData, CryptoHelpers } from "../utils/crypto_utils";
import { useAuthStore } from "../stores/auth_store";
import { expiresAbsolute } from "../utils/expires_utils";
import { useLanguage } from "../contexts/language_context";
const MAX_PIN_LENGTH = 4;

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
      setError(null);

      try {
        // A. 从 Secure Storage 读取数据
        const storedData = await loadInitialData();
        if (!storedData) {
          throw new Error("应用数据丢失或未初始化。");
        }

        const { salt, encryptedCredsPackage, iterations } = storedData;

        // B. 用 PIN 和 Salt 派生解密密钥
        const saltBuffer = CryptoHelpers.base64UrlToBuffer(salt);
        const derivedKey = await deriveKey(currentPin, saltBuffer, iterations);

        // C. 解密得到 Directus 凭证
        const encryptedPackage = JSON.parse(encryptedCredsPackage);
        const decryptedCredentials = await decryptData(
          { iv: encryptedPackage.iv, cipherText: encryptedPackage.cipherText },
          derivedKey
        );

        // 登录 Directus 获取 Token
        console.log("尝试使用解密凭证登录 Directus...");
        const { username, password } = decryptedCredentials;
        const email = username + "@example.com";

        const res = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              password: password,
            }),
          }
        );
        const authResponse = await res.json();

        const auth = {
          access_token: authResponse.data.access_token,
          refresh_token: authResponse.data.refresh_token,
          expires: expiresAbsolute(authResponse.data.expires),
        };

        loginWithAuth(auth);
        //  登录成功后，auth state 更新
        //  app根组件中的useTokenRefresh 会自动触发并调度刷新
        // await checkAndRefreshToken();
        // 成功：跳转到主应用界面
        navigate("/dashboard");
      } catch (e) {
        console.error("解锁或登录失败:", e);
        // 失败：可能是 PIN 错误、密钥派生失败、解密失败或网络/Directus 登录失败
        setError(`${t("pin_incorrect")}`);
        setPin(""); // 清空 PIN 码
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, loadInitialData, loginWithAuth, navigate]
  );

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔒</h1>
        <p className="text-gray-500 mb-6">{t("unlock")}</p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
            ⚠️ {error}
          </div>
        )}

        <input
          type="number"
          inputMode="numeric"
          value={pin}
          onChange={handlePinChange}
          placeholder={"••••"}
          className="w-full p-4 text-center text-3xl tracking-widest border-4 border-blue-400 rounded-lg focus:ring-blue-600 focus:border-blue-600 transition duration-150 disabled:bg-gray-100"
          maxLength={MAX_PIN_LENGTH}
          autoFocus
          disabled={isProcessing}
        />

        <p className="text-center text-sm text-gray-400 mt-6">
          {isProcessing ? `${t("processing")}` : ""}
        </p>
      </div>
    </div>
  );
};

export default PinUnlockScreen;
