"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthField, type AuthFieldProps } from "./auth-field";

export type PasswordFieldProps = Omit<AuthFieldProps, "type" | "endAdornment">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ disabled, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <AuthField
        ref={ref}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        endAdornment={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            surface="dark"
            disabled={disabled}
            onClick={() => setIsVisible((prev) => !prev)}
            aria-pressed={isVisible}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="h-8 w-8 text-neutral-400 hover:text-secondary-50"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        }
        {...props}
      />
    );
  },
);

PasswordField.displayName = "PasswordField";
