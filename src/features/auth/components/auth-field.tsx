"use client";

import React, { forwardRef } from "react";
import { Input, Label, type InputProps } from "@/components/ui";

export interface AuthFieldProps
  extends Omit<InputProps, "id" | "isError" | "surface"> {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  labelRight?: React.ReactNode;
  endAdornment?: React.ReactNode;
  hintId?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  (
    {
      id,
      label,
      error,
      required = false,
      labelRight,
      endAdornment,
      hintId,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const errorId = `${id}-error`;
    const describedByParts = [
      ariaDescribedBy,
      hintId,
      error ? errorId : undefined,
    ].filter(Boolean);
    const describedBy =
      describedByParts.length > 0 ? describedByParts.join(" ") : undefined;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
          {labelRight}
        </div>

        <div className="relative">
          <Input
            ref={ref}
            id={id}
            surface="dark"
            isError={Boolean(error)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${endAdornment ? "pr-11" : ""} ${className}`}
            {...props}
          />
          {endAdornment ? (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
              {endAdornment}
            </div>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs text-wrong-400 mt-1">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";
