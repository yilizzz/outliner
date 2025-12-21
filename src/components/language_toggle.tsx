import { useLanguage } from "../contexts/language_context";

const LanguageToggle = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <div className="text-dark-blue">
      <button onClick={toggleLanguage} className="text-2xl">
        {t("button")}
      </button>
    </div>
  );
};

export default LanguageToggle;
