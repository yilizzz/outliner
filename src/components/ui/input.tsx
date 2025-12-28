import { forwardRef, type InputHTMLAttributes } from "react";
import { ErrorLine } from "./error_line";
import { colorTheme, type Color } from "./theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: Color;
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { color = "blue", label, error, className, containerClassName, ...props },
    ref
  ) => {
    // 根据当前 color 选取的样式集
    const theme = colorTheme[color];
    const isError = !!error;

    // 基础样式
    const baseStyles =
      "outline-none px-3 py-1 text-sm w-full rounded-lg border bg-gray-50 transition-all duration-150 ease-in-out placeholder:text-gray-300";

    // 动态组合逻辑
    const statusStyles = isError
      ? "border-dark-red text-dark-red focus:ring-light-red focus:border-dark-red"
      : `${theme.border} ${theme.text} ${theme.ring} focus:border-dark-${color}`;

    return (
      <div
        className={`flex-1 flex flex-col gap-1.5 ${containerClassName || ""}`}
      >
        {label && (
          <label
            className={`tracking-wider ml-0.5 ${theme.label} uppercase text-sm font-light`}
          >
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
          maxLength={255}
        />

        {/* 错误提示 */}
        {error && <ErrorLine>{error}</ErrorLine>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
