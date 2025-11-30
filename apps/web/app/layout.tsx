import type { Metadata } from "next";
import "@aibos/ui/design/globals.css"; // Theme - full design system (primary)
import "./globals.css"; // Safe mode fallback - loads last, provides fallback tokens if theme fails

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
