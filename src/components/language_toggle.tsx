import { useLanguage } from "../contexts/language_context";

const LanguageToggle = () => {
  const { toggleLanguage, currentLang } = useLanguage();
  // 基础样式：定义大小、圆角、边框、居中对齐
  const baseStyle =
    "absolute w-4 h-4 flex items-center justify-center transition-all duration-200 border-2 rounded text-[12px] border-dark-blue";

  // 选中态样式
  const activeStyle = "bg-dark-blue text-white z-20";
  // 未选中态样式
  const inactiveStyle = "bg-white text-dark-blue z-10";
  return (
    <button onClick={toggleLanguage}>
      <div className="relative w-5 h-5">
        <span
          className={`${baseStyle} top-[-3px] left-[-3px] ${
            currentLang === "en" ? activeStyle : inactiveStyle
          }`}
        >
          A
        </span>
        <span
          style={{ top: "8px", left: "8px" }}
          className={`${baseStyle} ${
            currentLang === "zh" ? activeStyle : inactiveStyle
          }`}
        >
          中
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
