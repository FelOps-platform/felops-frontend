import type { Metadata } from "next";
import { SignUpForm } from "./_components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account | FelOps",
  description: "Create a FelOps account and start configuring your AI agents.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
