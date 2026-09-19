import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { CommissionShell } from "@/components/election-advisory/CommissionShell";
import { AEAC_NAME, aeacDefinition, AEAC_PUBLIC_DOMAIN } from "@/content/election-advisory/catalog";

import "./election-advisory.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-aeac-serif",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-aeac-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: AEAC_NAME,
    template: `%s · ${AEAC_NAME}`,
  },
  description: aeacDefinition,
  robots: { index: true, follow: true },
  alternates: { canonical: "/election-advisory" },
  openGraph: {
    title: AEAC_NAME,
    description: aeacDefinition,
    url: "/election-advisory",
    siteName: AEAC_PUBLIC_DOMAIN,
  },
};

export default function ElectionAdvisoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`aeac-root ${serif.variable} ${sans.variable}`}>
      <CommissionShell>{children}</CommissionShell>
    </div>
  );
}
