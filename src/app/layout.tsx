import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FelOps",
  description: "FelOps Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen bg-secondary-950 antialiased">
        {children}
      </body>
    </html>
  );
}
