import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all select-none cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-secondary-500 text-secondary-50 hover:bg-secondary-600 shadow-sm hover:shadow-md",
      secondary:
        "bg-secondary-900/60 text-secondary-100 hover:bg-secondary-900 hover:text-secondary-50 border border-secondary-50/15 shadow-xs",
      outline:
        "bg-transparent border border-secondary-50/20 text-secondary-50 hover:bg-secondary-900/40 hover:border-secondary-50/40 shadow-xs",
      ghost:
        "bg-transparent text-neutral-300 hover:text-secondary-50 hover:bg-secondary-900/50",
      danger:
        "bg-wrong-600 text-secondary-50 hover:bg-wrong-700 shadow-sm hover:shadow-md",
      success:
        "bg-right-600 text-secondary-950 hover:bg-right-500 font-bold shadow-sm hover:shadow-md",
    };

    const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5",
      icon: "w-9 h-9 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
