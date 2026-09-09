import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Hill Vote Tracker",
  description: "An auditable public-record database of Rep. French Hill's U.S. House voting record, including documented party and Trump alignment breaks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
