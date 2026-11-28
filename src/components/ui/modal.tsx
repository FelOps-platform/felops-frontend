"use client";

import React, { useEffect, useCallback, useId, useRef } from "react";
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
  closeDisabled?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  showCloseButton = true,
  surface = "dark",
  closeDisabled = false,
  initialFocusRef,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        if (!closeDisabled) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          panelRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first || !panelRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !panelRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, closeDisabled, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusTimer = window.requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        panelRef.current?.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen, handleKeyDown, initialFocusRef]);

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
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150 focus:outline-none ${containerStyles} ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            disabled={closeDisabled}
            onClick={onClose}
            aria-label="Close dialog"
            className={`absolute top-5 right-5 p-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${closeButtonStyles}`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {(title || description) && (
          <div className="mb-5 pr-8 space-y-1">
            {title && (
              <h2
                id={titleId}
                className={`text-lg sm:text-xl font-bold tracking-tight ${titleStyles}`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descriptionId}
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
