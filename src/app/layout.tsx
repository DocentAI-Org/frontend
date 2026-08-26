import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocentAI",
  description: "Teacher-guided AI for personalised education"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
