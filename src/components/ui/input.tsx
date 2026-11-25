import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  surface?: "dark" | "light";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      isError = false,
      surface = "dark",
      type = "text",
      ...props
    },
    ref,
  ) => {
    const isLight = surface === "light";
    const surfaceStyles = isLight
      ? isError
        ? "bg-wrong-50 text-neutral-950 placeholder:text-neutral-400 border-wrong-500 focus:border-wrong-500 focus:ring-wrong-500/20"
        : "bg-neutral-50 text-neutral-950 placeholder:text-neutral-400 border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-secondary-500/20"
      : isError
        ? "bg-wrong-500/5 text-secondary-50 placeholder:text-neutral-500 border-wrong-500 focus:border-wrong-500 focus:ring-wrong-500/20"
        : "bg-secondary-950/60 text-secondary-50 placeholder:text-neutral-500 border-secondary-50/20 hover:border-secondary-50/30 focus:border-secondary-500 focus:ring-secondary-500/20";

    return (
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all border focus:outline-none focus:ring-2 ${surfaceStyles} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
