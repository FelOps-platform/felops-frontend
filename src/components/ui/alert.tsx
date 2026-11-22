import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}

export function Alert({
  variant = "info",
  icon,
  children,
  className = "",
  ...props
}: AlertProps) {
  const variantStyles: Record<NonNullable<AlertProps["variant"]>, string> = {
    info: "bg-secondary-500/10 border-secondary-500/20 text-secondary-300",
    success: "bg-right-500/10 border-right-500/20 text-right-400",
    warning: "bg-secondary2-500/10 border-secondary2-500/20 text-secondary2-400",
    error: "bg-wrong-500/10 border-wrong-500/20 text-wrong-400",
  };

  const defaultIcons = {
    info: <Info className="w-4 h-4 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <div className="shrink-0 mt-0.5">{icon ?? defaultIcons[variant]}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AlertTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`font-semibold tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`mt-0.5 text-xs opacity-90 ${className}`} {...props}>
      {children}
    </div>
  );
}
