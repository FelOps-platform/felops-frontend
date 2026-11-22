import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FelOps",
  description: "FelOps Application",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen bg-secondary-950 antialiased">{children}</body>
    </html>
  );
}
