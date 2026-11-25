import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface WizardShellProps {
  backHref: string;
  backTitle?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardShell({
  backHref,
  backTitle = "Back",
  title,
  subtitle,
  children,
  className = "",
}: WizardShellProps) {
  return (
    <div className={`max-w-6xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Wizard Header with back navigation and title */}
      <div className="flex justify-between items-center mb-8 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href={backHref}
            className="w-10 h-10 rounded-xl border border-secondary-50/20 bg-secondary-900/60 flex items-center justify-center text-secondary-200 hover:bg-secondary-900 hover:text-secondary-50 transition-all shadow-xs cursor-pointer"
            title={backTitle}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary-50 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

export default WizardShell;
