"use client";

import { useState, useRef, useEffect } from "react";

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  title?: string;
  description?: string;
  onVerify: (otp: string) => void;
  onResend?: () => void;
}

export default function VerifyOtpModal({
  isOpen,
  onClose,
  email,
  title = "Verify your email",
  description = "Enter the 6-digit code sent to",
  onVerify,
  onResend,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(60);
      return;
    }

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);
  if (!isOpen) return null;

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      onVerify(code);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-secondry-950 border border-secondary-50 rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-secondary-50 hover:text-wrong-700 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-50 tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {description}{" "}
            <span className="text-secondary-50 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-11 h-14 text-center text-lg font-bold bg-neutral-900/40 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Verify
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-400 space-y-2">
          <p>
            Didn't receive it?{" "}
            <button
              type="button"
              disabled={timeLeft > 0}
              onClick={() => {
                setTimeLeft(60);
                onResend?.();
              }}
              className={`font-medium transition-colors ${
                timeLeft > 0
                  ? "text-neutral-600 cursor-not-allowed"
                  : "text-white hover:underline"
              }`}
            >
              Resend code
            </button>
          </p>
          <p className="text-neutral-500">
            {timeLeft > 0
              ? `Code expires in ${formatTime(timeLeft)}`
              : "Code expired"}
          </p>
        </div>
      </div>
    </div>
  );
}
