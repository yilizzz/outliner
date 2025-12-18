import React, { useState, useCallback } from "react";
import { createUser } from "@directus/sdk";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import {
  deriveKey,
  generateSalt,
  CryptoHelpers,
  encryptData,
  decryptData,
} from "../utils/crypto_utils";
import { directus } from "../lib/directus";
import { useSecureData } from "../stores/secure_data_store";
import { useAuthStore } from "../stores/auth_store";
import { expiresAbsolute } from "../utils/expires_utils";
import { useLanguage } from "../contexts/language_context";
const ITERATIONS = 200000;
const PinSetupScreen: React.FC = () => {
  const { t } = useLanguage();
  interface Values {
    pin: string;
    confirmPin: string;
  }
  const navigate = useNavigate();
  const { saveInitialData } = useSecureData();
  const { saveUserIdToStorage, loginWithAuth } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 动态创建 validation schema，每次语言改变时重新生成
  const getPinSetSchema = () =>
    Yup.object().shape({
      pin: Yup.string()
        .required(t("yup_required"))
        .matches(/^\d{4}$/, t("yup_pin_format")),
      confirmPin: Yup.string()
        .required(t("yup_required"))
        .oneOf([Yup.ref("pin")], t("yup_pin_mismatch"))
        .matches(/^\d{4}$/, t("yup_pin_format")),
    });

  const credentials = {
    generateCredentials: async () => ({
      username: `user_${crypto.randomUUID()}`,
      password: `${crypto.randomUUID()}`,
    }),
    encryptData: encryptData,
    decryptData: decryptData,
  };
  const handleSetupComplete = useCallback(
    async (finalPin: string) => {
      try {
        setIsProcessing(true);

        // --- 步骤 2: 生成 Salt & 派生密钥 ---
        const saltBuffer = generateSalt();
        const derivedKey = await deriveKey(finalPin, saltBuffer, ITERATIONS);

        // --- 步骤 3: 生成 Directus 凭证 ---
        const { username, password } = await credentials.generateCredentials();

        // --- 步骤 4: (新增/修正) 在 Directus 后台创建用户 ---
        const newUser = await directus.request(
          createUser({
            email: `${username}@example.com`,
            password: password,
            role: import.meta.env.VITE_DIRECTUS_ROLE_ID,
            status: "active",
          })
        );
        console.log(`Directus 用户 ${username} 创建成功。`);
        await saveUserIdToStorage(newUser.id);
        // --- 新增：用刚创建的凭证登录一次以获取 token（access + refresh） ---
        console.log("使用新凭证登录以获取 access/refresh token ...");
        const email = username + "@example.com";
        //Directus SDK 不返回refresh token，需调用 REST API
        // const response = await directus.login({
        //   email,
        //   password,
        // });
        // console.log(response);

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
        console.log(
          "绝对expire时间: ",
          expiresAbsolute(authResponse.data.expires)
        );
        const auth = {
          access_token: authResponse.data.access_token,
          refresh_token: authResponse.data.refresh_token,
          expires: expiresAbsolute(authResponse.data.expires),
        };
        loginWithAuth(auth);
        // 2. 登录成功后，useTokenRefresh 会自动开始工作
        //    不需要手动调用 checkAndRefreshToken
        // await checkAndRefreshToken();

        // --- 步骤 4: 加密 Directus 凭证 ---
        const encryptedCredentials = await credentials.encryptData(
          { username, password },
          derivedKey
        );

        // --- 步骤 5: 存储 ---

        // 5a. 存储 Salt (Base64 URL Safe 格式)
        const saltBase64 = CryptoHelpers.bufferToBase64Url(saltBuffer);

        // 5b. 存储加密凭证 (需要包含 IV/Nonce)
        const credentialsToStore = JSON.stringify({
          ...encryptedCredentials, // 包含 cipherText 和 IV
          iterations: ITERATIONS, // 存储迭代次数，以防未来修改
        });
        await saveInitialData(saltBase64, credentialsToStore);
        console.log("数据已存储:", saltBase64, credentialsToStore);
        // --- 步骤 6: 生成备份码 (简化处理：通常是 PIN + 凭证的另一个加密版本) ---
        // 暂时忽略备份码的完整生成，留待后续步骤。

        console.log("初始化所有安全组件成功！");
        navigate("/dashboard");
      } catch (e) {
        console.error("初始化失败：", e);
        setError(`${t("setup_error")}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [navigate]
  );
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="w-full flex flex-col justify-start items-center max-w-md mt-12 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center">
        <p className=" text-gray-500 mb-6">{t("set_pin")}</p>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
            ⚠️ {error}
          </div>
        )}
        <Formik
          initialValues={{
            pin: "",
            confirmPin: "",
          }}
          validationSchema={getPinSetSchema()}
          onSubmit={(values: Values) => {
            handleSetupComplete(values.pin);
          }}
        >
          {({ errors, touched }) => (
            <Form className="w-full">
              <div className="w-full flex flex-col justify-start items-start gap-4">
                <label htmlFor="pin">Pin</label>
                <Field
                  id="pin"
                  name="pin"
                  placeholder={t("placeholder_pin")}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-shadow-blue-600"
                />
                {errors.pin && touched.pin ? (
                  <div className="text-amber-800">{errors.pin}</div>
                ) : null}
                <label htmlFor="confirmPin">{t("confirm_pin")}</label>
                <Field
                  id="confirmPin"
                  name="confirmPin"
                  placeholder={t("placeholder_confirm_pin")}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.confirmPin && touched.confirmPin ? (
                  <div className="text-amber-800">{errors.confirmPin}</div>
                ) : null}
                <div className="w-full text-center">
                  <button type="submit">{t("submit")}</button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        {isProcessing ? (
          <div className="flex justify-center items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 16a8 8 0 100-16 8 8 0 000 16z"
              ></path>
            </svg>
            ...
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default PinSetupScreen;
