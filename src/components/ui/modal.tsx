"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  surface?: "dark" | "light";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  showCloseButton = true,
  surface = "dark",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isLight = surface === "light";
  const containerStyles = isLight
    ? "bg-neutral-50 border border-neutral-300 text-neutral-950"
    : "bg-secondary-900 border border-secondary-50/15 text-secondary-50";

  const closeButtonStyles = isLight
    ? "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60"
    : "text-neutral-400 hover:text-secondary-50 hover:bg-secondary-800";

  const titleStyles = isLight ? "text-neutral-950" : "text-secondary-50";
  const descriptionStyles = isLight ? "text-neutral-600" : "text-neutral-400";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150 ${containerStyles} ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`absolute top-5 right-5 p-1.5 rounded-xl transition-colors cursor-pointer ${closeButtonStyles}`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {(title || description) && (
          <div className="mb-5 pr-8 space-y-1">
            {title && (
              <h2
                className={`text-lg sm:text-xl font-bold tracking-tight ${titleStyles}`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={`text-xs sm:text-sm leading-relaxed ${descriptionStyles}`}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default Modal;
