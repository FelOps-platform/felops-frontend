"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@/components/ui";
import {
  AuthApiError,
  DEFAULT_AUTH_REDIRECT,
  mapAuthError,
  resendCode,
  signUp,
  signUpSchema,
  verifyEmail,
  type SignUpInput,
} from "@/features/auth";
import {
  AuthField,
  PasswordField,
  PasswordRequirements,
} from "@/features/auth/components";
import VerifyOtpModal from "../../_components/VerifyOtpModal";

export function SignUpForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // OTP Modal State (refactored in Phase 4)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = async (data: SignUpInput) => {
    setGeneralError(null);
    try {
      const response = await signUp({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      setRegisteredEmail(response.email);
      setOtpError(undefined);
      setIsOtpModalOpen(true);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      if (err instanceof AuthApiError && err.code === "EMAIL_TAKEN") {
        setError(
          "email",
          { type: "server", message },
          { shouldFocus: true },
        );
        return;
      }
      setGeneralError(message);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError(undefined);

    try {
      await verifyEmail({ email: registeredEmail, code: otpCode });
      setIsOtpModalOpen(false);
      router.replace(DEFAULT_AUTH_REDIRECT);
      router.refresh();
    } catch (err: unknown) {
      setOtpError(mapAuthError(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(undefined);

    try {
      await resendCode({ email: registeredEmail, purpose: "verify_email" });
    } catch (err: unknown) {
      setOtpError(mapAuthError(err));
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

      {generalError ? (
        <Alert variant="error" className="mb-4">
          {generalError}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthField
          id="fullName"
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          disabled={isSubmitting}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <AuthField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            hintId="password-requirements"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordRequirements
            id="password-requirements"
            value={passwordValue}
            showFailures={Boolean(errors.password || isSubmitted)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

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

      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={registeredEmail}
        isVerifying={isVerifyingOtp}
        error={otpError}
        onClearError={() => setOtpError(undefined)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
