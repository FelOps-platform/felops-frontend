"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signUpSchema } from "../schemas/auth";
import VerifyOtpModal from "../_components/VerifyOtpModal";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = signUpSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: {
        fullName?: string;
        email?: string;
        password?: string;
      } = {};
      validationResult.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof typeof fieldErrors;
        if (fieldName) {
          fieldErrors[fieldName] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sign-up form submitted with data:", validationResult.data);

      // TODO: Call backend sign-up API here
      // const response = await authService.signUp(validationResult.data);

      setOtpError(undefined);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setErrors({
        general: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    console.log("Verifying OTP code:", otpCode, "for email:", formData.email);

    try {
      // TODO: Call backend verify OTP API here
      // await authService.verifyOtp({ email: formData.email, code: otpCode });

      setIsOtpModalOpen(false);
      console.log("OTP verification completed successfully.");

      // TODO: Redirect user after successful verification (e.g., router.push("/dashboard"))
    } catch (err: any) {
      setOtpError(
        err?.message || "Invalid verification code. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    console.log("Resending OTP code to:", formData.email);
    setOtpError(undefined);

    try {
      // TODO: Call backend resend OTP API here
      // await authService.resendOtp({ email: formData.email });
    } catch (err: any) {
      setOtpError(err?.message || "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-secondary-50">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Start configuring your AI agents in minutes
        </p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-wrong-500/10 border border-wrong-500/20 text-wrong-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-300">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Hana Ehab"
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.fullName
                ? "border-wrong-500/80 focus:border-wrong-500"
                : "border-secondary-50/20 focus:border-secondary-50"
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-wrong-400 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-300">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.email
                ? "border-wrong-500/80 focus:border-wrong-500"
                : "border-secondary-50/20 focus:border-secondary-50"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-wrong-400 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-secondary-50 placeholder-neutral-500 text-sm focus:outline-none transition-colors pr-12 ${
                errors.password
                  ? "border-wrong-500/80 focus:border-wrong-500"
                  : "border-secondary-50/20 focus:border-secondary-50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-secondary-50 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-wrong-400 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-50 text-secondary-950 font-semibold text-sm hover:bg-secondary-100 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>

        {/* Sign In Link */}
        <div className="flex items-center justify-center text-xs text-neutral-400 pt-2 gap-1.5">
          <span>Already have an account?</span>
          <Link
            href="/sign-in"
            className="text-secondary-50 font-medium hover:underline hover:text-neutral-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>

      {/* OTP Verification Modal */}
      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={formData.email}
        isVerifying={isVerifyingOtp}
        error={otpError}
        onClearError={() => setOtpError(undefined)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
