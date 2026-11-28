"use client";

import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Modal } from "@/components/ui";

export interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  title?: string;
  description?: string;
  actionText?: string;
  isVerifying?: boolean;
  error?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  onVerify: (otp: string) => Promise<boolean | void> | boolean | void;
  onResend?: () => Promise<void> | void;
  onClearError?: () => void;
}

const OTP_LENGTH = 6;

function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function getSecondsUntil(isoTimestamp: string | undefined, nowMs: number): number {
  if (!isoTimestamp) return 0;
  const targetMs = new Date(isoTimestamp).getTime();
  if (Number.isNaN(targetMs)) return 0;
  return Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
}

interface VerifyOtpModalBodyProps {
  email: string;
  description: string;
  actionText: string;
  isVerifying: boolean;
  error?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  onVerify: (otp: string) => Promise<boolean | void> | boolean | void;
  onResend?: () => Promise<void> | void;
  onClearError?: () => void;
}

function VerifyOtpModalBody({
  email,
  description,
  actionText,
  isVerifying,
  error,
  expiresAt,
  resendAvailableAt,
  firstInputRef,
  onVerify,
  onResend,
  onClearError,
}: VerifyOtpModalBodyProps) {
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [isResending, setIsResending] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expirySecondsLeft = expiresAt ? getSecondsUntil(expiresAt, nowMs) : null;
  const resendSecondsLeft = resendAvailableAt
    ? getSecondsUntil(resendAvailableAt, nowMs)
    : 0;

  const isExpired = expirySecondsLeft !== null && expirySecondsLeft <= 0;
  const isComplete = otp.every((digit) => digit !== "");

  const setInputRef = (el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el;
    if (index === 0) {
      firstInputRef.current = el;
    }
  };

  const applyDigitsFromIndex = (digits: string, startIndex: number) => {
    const cleaned = digits.replace(/\D/g, "");
    if (!cleaned) return;

    const nextOtp = [...otp];
    let cursor = startIndex;

    for (const char of cleaned) {
      if (cursor >= OTP_LENGTH) break;
      nextOtp[cursor] = char;
      cursor += 1;
    }

    setOtp(nextOtp);
    setShakeTrigger(false);
    if (error) onClearError?.();

    const focusTarget = Math.min(cursor, OTP_LENGTH - 1);
    inputRefs.current[focusTarget]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    const digitsOnly = value.replace(/\D/g, "");

    if (!digitsOnly) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      if (error) onClearError?.();
      return;
    }

    // Handle OS SMS/email autofill or multi-character input into a single box
    if (digitsOnly.length > 1) {
      applyDigitsFromIndex(digitsOnly, index === 0 ? 0 : index);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digitsOnly;
    setOtp(nextOtp);
    setShakeTrigger(false);

    if (error) onClearError?.();

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLElement>,
    startIndex: number = 0,
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digitsOnly) return;

    // Pasting a full 6-digit code always populates from box 0
    const targetStart = digitsOnly.length === OTP_LENGTH ? 0 : startIndex;
    applyDigitsFromIndex(digitsOnly, targetStart);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        e.preventDefault();
        const nextOtp = [...otp];
        nextOtp[index] = "";
        setOtp(nextOtp);
        if (error) onClearError?.();
        return;
      }

      if (index > 0) {
        e.preventDefault();
        const nextOtp = [...otp];
        nextOtp[index - 1] = "";
        setOtp(nextOtp);
        if (error) onClearError?.();
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      inputRefs.current[0]?.focus();
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH || isVerifying || isExpired) return;

    const result = await onVerify(code);
    if (result === false) {
      setOtp(Array(OTP_LENGTH).fill(""));
      setShakeTrigger(true);
      window.requestAnimationFrame(() => {
        inputRefs.current[0]?.focus();
      });
    }
  };

  const handleResendClick = async () => {
    if (resendSecondsLeft > 0 || isVerifying || isResending || !onResend) return;

    setIsResending(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setShakeTrigger(false);
    onClearError?.();

    try {
      await onResend();
      setNowMs(Date.now());
    } finally {
      setIsResending(false);
      window.requestAnimationFrame(() => {
        inputRefs.current[0]?.focus();
      });
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-xs sm:text-sm text-neutral-600 text-center -mt-2">
        {description}{" "}
        <span className="text-neutral-900 font-semibold break-all">
          {email}
        </span>
      </p>

      {error ? (
        <Alert
          variant="error"
          className="bg-wrong-50 border-wrong-200 text-wrong-700"
        >
          {error}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div
          role="group"
          aria-label="6-digit verification code"
          className={`flex justify-center gap-2 sm:gap-3 transition-transform ${
            shakeTrigger ? "animate-pulse" : ""
          }`}
          onPaste={(e) => handlePaste(e, 0)}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => setInputRef(el, index)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
              aria-invalid={Boolean(error)}
              maxLength={index === 0 ? OTP_LENGTH : 1}
              disabled={isVerifying}
              value={digit}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => handleChange(e.target.value, index)}
              onPaste={(e) => {
                e.stopPropagation();
                handlePaste(e, index);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-11 h-14 text-center text-lg font-bold rounded-xl transition-all disabled:opacity-50 ${
                error
                  ? "bg-wrong-50/60 border border-wrong-500 text-wrong-700 focus:outline-none focus:ring-2 focus:ring-wrong-500/20"
                  : "bg-neutral-50 border border-neutral-300 text-neutral-900 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
              }`}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          surface="light"
          isLoading={isVerifying}
          disabled={!isComplete || isExpired}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : actionText}
        </Button>
      </form>

      <div className="text-center text-xs text-neutral-600 space-y-2 pt-1">
        <div className="flex items-center justify-center gap-1.5">
          <span>Didn&apos;t receive a code?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            surface="light"
            isLoading={isResending}
            disabled={resendSecondsLeft > 0 || isVerifying}
            onClick={handleResendClick}
            className="h-auto px-2 py-1 text-xs font-semibold text-secondary-600 hover:text-secondary-700"
          >
            {resendSecondsLeft > 0
              ? `Resend in ${formatCountdown(resendSecondsLeft)}`
              : "Resend code"}
          </Button>
        </div>

        {expirySecondsLeft !== null ? (
          <p className={isExpired ? "text-wrong-600 font-medium" : "text-neutral-500"}>
            {isExpired
              ? "Code expired. Please request a new verification code."
              : `Code expires in ${formatCountdown(expirySecondsLeft)}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function VerifyOtpModal({
  isOpen,
  onClose,
  email,
  title = "Verify your email",
  description = "Enter the 6-digit code sent to",
  actionText = "Verify Code",
  isVerifying = false,
  error,
  expiresAt,
  resendAvailableAt,
  onVerify,
  onResend,
  onClearError,
}: VerifyOtpModalProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      surface="light"
      closeDisabled={isVerifying}
      initialFocusRef={firstInputRef}
      className="max-w-md text-center"
    >
      {isOpen ? (
        <VerifyOtpModalBody
          email={email}
          description={description}
          actionText={actionText}
          isVerifying={isVerifying}
          error={error}
          expiresAt={expiresAt}
          resendAvailableAt={resendAvailableAt}
          firstInputRef={firstInputRef}
          onVerify={onVerify}
          onResend={onResend}
          onClearError={onClearError}
        />
      ) : null}
    </Modal>
  );
}

export default VerifyOtpModal;
