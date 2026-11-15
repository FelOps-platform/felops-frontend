import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 text-secondary-50">
      <main className="text-5xl font-bold tracking-wider">Welcome to FelOps</main>
      <Link
        href="/sign-in"
        className="px-6 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}
