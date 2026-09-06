import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { BookShell } from "@/components/macroscopic-life/BookShell";

import "./macroscopic-life.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-ml-serif",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ml-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ml-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Macroscopic Life",
    template: "%s · Macroscopic Life",
  },
  description:
    "Book One: What If We Are the Microbe? A reading instrument for nested scale, evidence, and a theory that can lose.",
};

export default function MacroscopicLifeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ml-root ${serif.variable} ${sans.variable} ${mono.variable}`}>
      <BookShell>{children}</BookShell>
    </div>
  );
}
