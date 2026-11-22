import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", isError = false, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all placeholder:text-neutral-500 bg-secondary-950/60 text-secondary-50 border focus:outline-none focus:ring-2 ${
          isError
            ? "border-wrong-500 bg-wrong-500/5 focus:border-wrong-500 focus:ring-wrong-500/20"
            : "border-secondary-50/20 hover:border-secondary-50/30 focus:border-secondary-500 focus:ring-secondary-500/20"
        } ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
