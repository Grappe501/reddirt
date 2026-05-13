import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kelly Calendar",
  robots: { index: false, follow: false },
};

export default function KellyCalendarPublicLayout({ children }: { children: ReactNode }) {
  return children;
}
