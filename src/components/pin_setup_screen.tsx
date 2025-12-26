import React, { useState, useCallback } from "react";
import { createUser, createItem, createItems } from "@directus/sdk";
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
import { useCreateChapter } from "../queries/chapter.queries";
import { Loader } from "lucide-react";
import { ErrorLine } from "./ui/error_line";
const ITERATIONS = 200000;
const PinSetupScreen: React.FC = () => {
  const { t, currentLang } = useLanguage();
  interface Values {
    pin: string;
    confirmPin: string;
  }
  const navigate = useNavigate();
  const { saveInitialData } = useSecureData();
  const { saveUserIdToStorage, loginWithAuth } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createChapterMutation = useCreateChapter();

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
      if (isProcessing) return;
      setIsProcessing(true);
      setError(null);
      try {
        // --- 阶段 1: 加密准备 ---
        let saltBuffer, derivedKey;
        try {
          // 检查 API 是否存在
          if (!window.crypto || !window.crypto.subtle) {
            throw new Error("CRYPTO_NOT_AVAILABLE");
          }

          saltBuffer = generateSalt();
          derivedKey = await deriveKey(finalPin, saltBuffer, ITERATIONS);
        } catch (e) {
          // 如果是环境问题
          if (e.message === "CRYPTO_NOT_AVAILABLE") {
            throw new Error("ENV_UNSUPPORTED");
          }
          // 如果是算法执行报错（可能是参数问题）
          throw new Error("CRYPTO_EXECUTION_FAILED");
        }

        // --- 阶段 2: 远程账户创建 ---
        const { username, password } = await credentials.generateCredentials();
        let newUser;
        try {
          newUser = await directus.request(
            createUser({
              email: `${username}@example.com`,
              password: password,
              role: import.meta.env.VITE_DIRECTUS_ROLE_ID,
              status: "active",
            })
          );
        } catch (e) {
          throw new Error("CREATE_USER_FAILED");
        }

        await saveUserIdToStorage(newUser.id);
        const email = `${username}@example.com`;

        // --- 阶段 3: 获取访问令牌 (Auth) ---
        let authResponse;
        try {
          const res = await fetch(
            `${import.meta.env.VITE_DIRECTUS_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );
          if (!res.ok) throw new Error();
          authResponse = await res.json();
        } catch (e) {
          throw new Error("AUTH_SESSION_FAILED");
        }

        const auth = {
          access_token: authResponse.data.access_token,
          refresh_token: authResponse.data.refresh_token,
          expires: expiresAbsolute(authResponse.data.expires),
        };
        loginWithAuth(auth);

        // --- 阶段 4: 初始化用户数据 (Project/Chapters) ---
        try {
          const projectTitle =
            currentLang === "en" ? "My example work" : "示例作品";
          const createdProject = await directus.request(
            createItem("projects", {
              title: projectTitle,
              user_created: newUser.id,
            })
          );
          const project = createdProject?.id;

          await directus.request(
            createItems("chapters", [
              { project, title: "1", sort: 1, content: "" },
              { project, title: "2", sort: 2, content: "" },
              { project, title: "3", sort: 3, content: "" },
            ])
          );
        } catch (e) {
          console.warn("Initial data creation partially failed", e);
        }

        // --- 阶段 5: 本地持久化存储 ---
        try {
          const encryptedCredentials = await credentials.encryptData(
            { username, password },
            derivedKey
          );
          const saltBase64 = CryptoHelpers.bufferToBase64Url(saltBuffer);
          const credentialsToStore = JSON.stringify({
            ...encryptedCredentials,
            iterations: ITERATIONS,
          });
          await saveInitialData(saltBase64, credentialsToStore);
        } catch (e) {
          throw new Error("LOCAL_STORAGE_FAILED");
        }

        navigate("/dashboard");
      } catch (e: any) {
        console.error("Setup Error Details:", e);

        // 根据错误标识符映射多语言文案
        switch (e.message) {
          case "ENV_UNSUPPORTED":
            setError(t("error_crypto_unsupported"));
            break;
          case "CRYPTO_EXECUTION_FAILED":
            setError(t("error_crypto_execution"));
            break;
          case "CREATE_USER_FAILED":
            setError(t("error_network_or_server"));
            break;
          case "AUTH_SESSION_FAILED":
            setError(t("error_auth_service"));
            break;
          case "LOCAL_STORAGE_FAILED":
            setError(t("error_storage_full"));
            break;
          default:
            setError(t("setup_error"));
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      navigate,
      isProcessing,
      currentLang,
      loginWithAuth,
      saveInitialData,
      saveUserIdToStorage,
      t,
      createChapterMutation,
    ]
  );
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
        <p className=" text-dark-blue text-center font-bold">{t("set_pin")}</p>
        {error && <ErrorLine>{error}</ErrorLine>}
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
            <Form className="w-full flex flex-col justify-start items-start gap-4">
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <label htmlFor="pin" className="text-dark-blue text-sm">
                  Pin
                </label>
                <Field
                  id="pin"
                  name="pin"
                  placeholder={t("placeholder_pin")}
                  className="w-full h-10 px-3 border border-dark-blue rounded-lg focus:outline-none focus:ring-3 focus:ring-light-blue"
                />
                {errors.pin && touched.pin ? (
                  <ErrorLine>{errors.pin}</ErrorLine>
                ) : null}
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <label htmlFor="confirmPin" className="text-dark-blue text-sm">
                  {t("confirm_pin")}
                </label>
                <Field
                  id="confirmPin"
                  name="confirmPin"
                  placeholder={t("placeholder_confirm_pin")}
                  className="w-full h-10 px-3 border border-dark-blue rounded-lg focus:outline-none focus:ring-3 focus:ring-light-blue"
                />
                {errors.confirmPin && touched.confirmPin ? (
                  <ErrorLine>{errors.confirmPin}</ErrorLine>
                ) : null}
                <div className="w-full text-center">
                  <button type="submit" className="text-dark-blue">
                    {t("submit")}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        {isProcessing ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default PinSetupScreen;
