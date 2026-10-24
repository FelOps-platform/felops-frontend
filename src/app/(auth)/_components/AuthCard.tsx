import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[540px] rounded-[24px] border border-secondary-50 bg-transparent p-8 sm:p-10 shadow-2xl">
      {children}
    </div>
  );
}
