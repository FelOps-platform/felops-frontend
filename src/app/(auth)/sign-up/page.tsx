"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUpSchema } from "../schemas/auth";
import VerifyOtpModal from "../_components/VerifyOtpModal";

export default function SignUpForm() {
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
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      // TODO: Call backend API via auth service and open the OTP verification modal
      console.log("Validated Data ready for API:", validationResult.data);
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
    try {
      // TODO: Call backend verify OTP service
      // const response = await authService.verifyOtp({ email: formData.email, code: otpCode });

      console.log("Verifying OTP code:", otpCode, "for email:", formData.email);

      // TODO: On success, redirect the user to the dashboard or home page
      // router.push("/dashboard");
    } catch (err: any) {
      // TODO: Handle error (e.g., invalid or expired code)
      console.error("Verification failed:", err.message);
    }
  };
  const handleResendOtp = async () => {
    try {
      // TODO: Call backend API to resend OTP code for this email
      // await authService.resendOtp({ email: formData.email });
      console.log("Resending new OTP code to:", formData.email);
    } catch (err: any) {
      console.error("Failed to resend OTP:", err.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Start configuring your AI agents in minutes
        </p>
      </div>
      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-white placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.fullName
                ? "border-red-500/80 focus:border-red-500"
                : "border-secondary/50 focus:border-white"
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-300">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="You@Company.com"
            className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-white placeholder-neutral-500 text-sm focus:outline-none transition-colors ${
              errors.email
                ? "border-red-500/80 focus:border-red-500"
                : "border-secondary/50 focus:border-white"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </div>
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
              className={`w-full px-4 py-3 rounded-xl bg-neutral-900/40 border text-white placeholder-neutral-500 text-sm focus:outline-none transition-colors pr-12 ${
                errors.password
                  ? "border-red-500/80 focus:border-red-500"
                  : "border-secondary/50 focus:border-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Create Account"}
        </button>
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-0">
          <Link
            href="/signin"
            className="hover:text-neutral-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>
      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={formData.email}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
