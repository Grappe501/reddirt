import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketLab",
  description: "Competitive market simulation and financial decision laboratory.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
