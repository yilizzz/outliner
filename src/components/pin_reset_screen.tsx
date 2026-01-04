import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import {
  deriveKey,
  generateSalt,
  CryptoHelpers,
  encryptData,
} from "../utils/crypto_utils";
import { useSecureData } from "../stores/secure_data_store";
import { useAuthStore } from "../stores/auth_store";
import { expiresAbsolute } from "../utils/expires_utils";
import { useLanguage } from "../contexts/language_context";
import { LockKeyhole, Bean } from "lucide-react";
import { ErrorLine } from "./ui/error_line";
import { Button } from "./ui/button";
import { Loader } from "./ui/loader";

const ITERATIONS = 200000;

const PinResetScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveInitialData } = useSecureData();
  const { loginWithAuth } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showEnvWarning, setShowEnvWarning] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const getPinResetSchema = () =>
    Yup.object().shape({
      pin: Yup.string()
        .required(t("yup_required"))
        .matches(/^\d{4}$/, t("yup_pin_format")),
      confirmPin: Yup.string()
        .required(t("yup_required"))
        .oneOf([Yup.ref("pin")], t("yup_pin_mismatch"))
        .matches(/^\d{4}$/, t("yup_pin_format")),
    });

  // Verify token on mount
  useEffect(() => {
    // Warn users if they are inside an in-app browser instead of installed PWA/primary browser
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setShowEnvWarning(!isStandalone);

    const verifyToken = async () => {
      if (!token || !email) {
        setError(t("invalid_reset_link"));
        setIsVerifying(false);
        return;
      }

      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_DIRECTUS_URL
          }/pin-reset/verify/${token}?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
          }
        );

        const data = await res.json();

        if (data.valid) {
          setIsValid(true);
        } else {
          setError(t("invalid_reset_link"));
        }
      } catch (e) {
        setError(t("invalid_reset_link"));
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, email, t]);

  const handleResetComplete = useCallback(
    async (newPin: string) => {
      if (isProcessing || !token || !email) return;
      setIsProcessing(true);
      setError(null);

      try {
        // Step 1: Complete reset on backend (get new password)
        const resetRes = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/pin-reset/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email }),
          }
        );

        if (!resetRes.ok) {
          throw new Error("Reset failed");
        }

        const resetData = await resetRes.json();

        if (!resetData.success) {
          throw new Error(resetData.error || "Reset failed");
        }

        const newPassword = resetData.password;

        // Step 2: Encrypt new credentials with new PIN
        const saltBuffer = generateSalt();
        const derivedKey = await deriveKey(newPin, saltBuffer, ITERATIONS);
        const encryptedCredentials = await encryptData(
          { email, password: newPassword },
          derivedKey
        );

        const saltBase64 = CryptoHelpers.bufferToBase64Url(saltBuffer);
        const credentialsToStore = JSON.stringify({
          ...encryptedCredentials,
          iterations: ITERATIONS,
        });

        await saveInitialData(saltBase64, credentialsToStore);

        setResetSuccess(true);
      } catch (e: any) {
        setError(t("reset_failed"));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, token, email, saveInitialData, loginWithAuth, navigate, t]
  );

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
          <LockKeyhole className="text-red-500" size={48} />
          <h2 className="text-red-500 text-xl font-bold text-center">
            {t("invalid_reset_link")}
          </h2>
          <Button onClick={() => navigate("/")}>{t("home")}</Button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
          <LockKeyhole className="text-green-500" size={48} />
          <h2 className="text-green-500 text-xl font-bold text-center">
            {t("reset_success")}
          </h2>
          <div className="text-gray-600 text-sm text-center">
            {t("reset_success_desc")}
          </div>
          <Button onClick={() => navigate("/dashboard")}>{t("login")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
        <LockKeyhole className="text-dark-blue" size={24} />
        <h2 className="text-dark-blue text-xl font-bold">
          {t("reset_pin_title")}
        </h2>
        <p className="text-gray-600 text-sm text-center">
          {t("reset_pin_desc")}
        </p>

        {showEnvWarning && (
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
            Tip: Open this link in the installed app, please.
          </div>
        )}

        {error && <ErrorLine>{error}</ErrorLine>}

        <Formik
          initialValues={{
            pin: "",
            confirmPin: "",
          }}
          validationSchema={getPinResetSchema()}
          onSubmit={(values) => {
            handleResetComplete(values.pin);
          }}
        >
          {({ errors, touched }) => (
            <Form className="w-full flex flex-col justify-start items-start gap-4">
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <label htmlFor="pin" className="text-dark-blue text-sm">
                  {t("new_pin")}
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
              </div>
              <div className="w-full text-center">
                <Button
                  type="submit"
                  disabled={
                    (errors.confirmPin && touched.confirmPin) ||
                    (errors.pin && touched.pin) ||
                    !touched.pin ||
                    !touched.confirmPin ||
                    isProcessing
                  }
                >
                  {t("submit")}
                </Button>
                {isProcessing && <Loader className="h-4! mt-2" />}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PinResetScreen;
