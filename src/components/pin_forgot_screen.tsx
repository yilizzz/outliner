import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useLanguage } from "../contexts/language_context";
import { Mail } from "lucide-react";
import { ErrorLine } from "./ui/error_line";
import { Button } from "./ui/button";
import { Loader } from "./ui/loader";

const PinForgotScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const getEmailSchema = () =>
    Yup.object().shape({
      email: Yup.string()
        .required(t("yup_required"))
        .email(t("yup_email_invalid")),
    });

  const handleSubmit = async (values: { email: string }) => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_DIRECTUS_URL}/pin-reset/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      const data = await res.json();

      if (data.success) {
        setEmailSent(true);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (e: any) {
      setError(t("reset_failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
          <Mail className="text-dark-blue" size={48} />
          <h2 className="text-dark-blue text-xl font-bold text-center">
            {t("check_email_title")}
          </h2>
          <p className="text-gray-600 text-sm text-center">
            {t("check_email_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl flex flex-col justify-center items-center gap-6">
        <Mail className="text-dark-blue" size={24} />
        <h2 className="text-dark-blue text-xl font-bold">
          {t("forgot_pin_title")}
        </h2>
        <p className="text-gray-600 text-sm text-center">
          {t("forgot_pin_desc")}
        </p>

        {error && <ErrorLine>{error}</ErrorLine>}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={getEmailSchema()}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="w-full flex flex-col justify-start items-start gap-4">
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <label htmlFor="email" className="text-dark-blue text-sm">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("placeholder_email")}
                  className="w-full h-10 px-3 border border-dark-blue rounded-lg focus:outline-none focus:ring-3 focus:ring-light-blue"
                />
                {errors.email && touched.email ? (
                  <ErrorLine>{errors.email}</ErrorLine>
                ) : null}
              </div>

              <div className="w-full text-center">
                <Button
                  type="submit"
                  disabled={
                    (errors.email && touched.email) ||
                    !touched.email ||
                    isProcessing
                  }
                >
                  {t("send_reset_link")}
                </Button>
                {isProcessing && <Loader className="h-4! mt-2" />}
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-sm text-gray-500 hover:underline mt-2"
              >
                {t("cancel")}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PinForgotScreen;
