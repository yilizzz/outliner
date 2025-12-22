import { forwardRef, type InputHTMLAttributes } from "react";

// 定义支持的颜色类型
type InputColor = "blue" | "red" | "green";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: InputColor;
  label?: string;
  error?: string;
  containerClassName?: string;
}

// 方案 A：建立完整的类名映射表
// 这里的字符串是完整的，Tailwind 扫描器可以完美识别并生成 CSS
const colorTheme = {
  blue: {
    text: "text-dark-blue",
    border: "border-dark-blue",
    ring: "focus:ring-light-blue",
    caret: "caret-dark-blue",
    label: "text-dark-blue",
  },
  red: {
    text: "text-dark-red",
    border: "border-dark-red",
    ring: "focus:ring-light-red",
    caret: "caret-dark-red",
    label: "text-dark-red",
  },
  green: {
    text: "text-dark-green",
    border: "border-dark-green",
    ring: "focus:ring-light-green",
    caret: "caret-dark-green",
    label: "text-dark-green",
  },
};

const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { color = "blue", label, error, className, containerClassName, ...props },
    ref
  ) => {
    // 根据当前 color 选取的样式集
    const theme = colorTheme[color];
    const isError = !!error;

    // 基础样式
    const baseStyles =
      "outline-none px-3 py-1 w-full rounded-lg border bg-gray-50 transition-all duration-150 ease-in-out placeholder:text-gray-200";

    // 动态组合逻辑
    const statusStyles = isError
      ? "border-dark-red text-dark-red focus:ring-light-red focus:border-dark-red"
      : `${theme.border} ${theme.text} ${theme.ring} focus:border-dark-${color}`;

    return (
      <div
        className={`flex-1 flex flex-col gap-1.5 ${containerClassName || ""}`}
      >
        {label && (
          <label className={`font-bold tracking-wider ml-0.5 ${theme.label}`}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${statusStyles}
            ${theme.caret}
            focus:ring-3
            ${className || ""}
          `}
          {...props}
        />

        {/* 错误提示 */}
        {error && (
          <span className="text-xs text-dark-red mt-0.5 ml-0.5 animate-pulse">
            {error}
          </span>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
