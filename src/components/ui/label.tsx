import React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  required = false,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`block text-xs font-semibold text-neutral-300 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-secondary-500 ml-1">*</span>}
    </label>
  );
}
