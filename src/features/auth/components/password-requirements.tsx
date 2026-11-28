"use client";

import { Check, Circle } from "lucide-react";

interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: "8 to 72 characters",
    test: (value) => value.length >= 8 && value.length <= 72,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "One special character (e.g. !@#$%)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export interface PasswordRequirementsProps {
  id?: string;
  value: string;
  showFailures?: boolean;
}

export function PasswordRequirements({
  id,
  value,
  showFailures = false,
}: PasswordRequirementsProps) {
  const hasInput = value.length > 0;

  return (
    <ul
      id={id}
      aria-label="Password requirements"
      className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 pt-1 text-xs"
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        const failed = (hasInput || showFailures) && !passed;

        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 transition-colors ${
              passed
                ? "text-right-400"
                : failed
                  ? "text-wrong-400"
                  : "text-neutral-400"
            }`}
          >
            {passed ? (
              <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-3 h-3 shrink-0" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
