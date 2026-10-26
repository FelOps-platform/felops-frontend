import React from "react";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function BaseCard({ children, className = "" }: BaseCardProps) {
  return (
    <div
      className={`w-full max-w-[540px] rounded-[24px] border border-secondary-50 bg-transparent p-8 sm:p-10 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}
