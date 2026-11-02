"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  title?: string;
  description?: string;
  actionText?: string;
  isVerifying?: boolean;
  error?: string;
  onVerify: (otp: string) => void;
  onResend?: () => void;
  onClearError?: () => void;
}

export default function VerifyOtpModal({
  isOpen,
  onClose,
  email,
  title = "Verify your email",
  description = "Enter the 6-digit code sent to",
  actionText = "Verify Code",
  isVerifying = false,
  error,
  onVerify,
  onResend,
  onClearError,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state and focus first input on open
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(60);
      onClearError?.();
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle countdown timer safely without recreation drift
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isVerifying) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isVerifying, onClose]);

  const handleChange = (value: string, index: number) => {
    // Only accept numeric inputs
    const numericChar = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = numericChar;
    setOtp(newOtp);

    if (error) onClearError?.();

    if (numericChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, 6);

    if (!digitsOnly) return;

    const newOtp = [...otp];
    digitsOnly.split("").forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit;
      }
    });

    setOtp(newOtp);
    if (error) onClearError?.();

    // Focus appropriate input box
    const focusIndex = Math.min(digitsOnly.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResendClick = () => {
    if (timeLeft > 0 || isVerifying) return;
    setTimeLeft(60);
    setOtp(["", "", "", "", "", ""]);
    onClearError?.();
    inputRefs.current[0]?.focus();
    onResend?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isVerifying) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isVerifying}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-800 p-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            {description}{" "}
            <span className="text-neutral-900 font-semibold break-all">
              {email}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-wrong-50 border border-wrong-200 text-wrong-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-wrong-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                disabled={isVerifying}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-11 h-14 text-center text-lg font-bold rounded-xl transition-all disabled:opacity-50 ${error
                    ? "bg-wrong-50/40 border border-wrong-500 text-wrong-700 focus:outline-none focus:ring-2 focus:ring-wrong-500/20"
                    : "bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
                  }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isComplete || isVerifying}
            className="w-full py-3.5 px-4 rounded-xl bg-secondary-500 text-white font-semibold text-sm hover:bg-secondary-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>{actionText}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-600 space-y-2">
          <p>
            Didn't receive it?{" "}
            <button
              type="button"
              disabled={timeLeft > 0 || isVerifying}
              onClick={handleResendClick}
              className={`font-semibold transition-colors ${timeLeft > 0 || isVerifying
                  ? "text-neutral-400 cursor-not-allowed"
                  : "text-secondary-500 hover:text-secondary-600 hover:underline cursor-pointer"
                }`}
            >
              Resend code
            </button>
          </p>
          <p className="text-neutral-500">
            {timeLeft > 0
              ? `Code expires in ${formatTime(timeLeft)}`
              : "Code expired. Please request a new one."}
          </p>
        </div>
      </div>
    </div>
  );
}
