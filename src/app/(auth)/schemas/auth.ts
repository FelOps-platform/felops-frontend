import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z
    .string()
    .regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
