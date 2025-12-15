import { useLanguage } from "../contexts/language_context";

const LanguageToggle = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={toggleLanguage}>{t("button")}</button>
    </div>
  );
};

export default LanguageToggle;
