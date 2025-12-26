import React from "react";
import { Loader } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 touch-manipulation";

    const variants = {
      primary: "bg-dark-blue text-white ",
      secondary: "bg-dark-green text-white ",
      danger: "bg-dark-red text-white ",
      ghost: "bg-transparent text-dark-blue ",
      outline: "border border-gray-300 bg-transparent text-dark-blue ",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-2 rounded-full",
    };

    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
