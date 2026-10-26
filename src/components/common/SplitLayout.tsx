import React from "react";
import Image from "next/image";
import Link from "next/link";
import BaseCard from "@/components/common/BaseCard";

export interface SplitLayoutProps {
  children: React.ReactNode;
  heroTitle?: React.ReactNode;
  heroDescription?: string;
  cardClassName?: string;
}

export default function SplitLayout({
  children,
  heroTitle = (
    <>
      Move work forward,
      <br />
      with control built in.
    </>
  ),
  heroDescription = "Felops connects people, AI Agents, and enterprise systems in one governed operating layer.",
  cardClassName = "",
}: SplitLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-secondary-950 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[10px]">
          <Image
            src="/object.png"
            alt="Background Glow"
            fill
            priority
            className="object-contain mix-blend-screen"
          />
        </div>
      </div>

      <header className="relative z-20 w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-6 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/Logo.png"
                alt="FelOps Logo Icon"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="relative h-6 w-28 shrink-0">
              <Image
                src="/felops.svg"
                alt="FelOps"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-6 lg:px-16 py-12 gap-12 max-w-[1440px] mx-auto w-full">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-secondary-50 leading-[1.18]">
            {heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
            {heroDescription}
          </p>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center w-full">
          <BaseCard className={cardClassName}>{children}</BaseCard>
        </div>
      </main>
    </div>
  );
}
