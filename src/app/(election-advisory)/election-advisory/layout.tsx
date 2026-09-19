import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { CommissionShell } from "@/components/election-advisory/CommissionShell";
import { AEAC_NAME, AEAC_PUBLIC_DOMAIN, aeacDefinition } from "@/content/election-advisory/catalog";
import { AEAC_CANONICAL_ORIGIN, isAeacHost } from "@/lib/election-advisory/public-origin";
import { getAeacHref, getRequestHost } from "@/lib/election-advisory/public-origin-server";

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

export async function generateMetadata(): Promise<Metadata> {
  const host = await getRequestHost();
  const canonicalPath = await getAeacHref();
  const canonical = isAeacHost(host) ? `${AEAC_CANONICAL_ORIGIN}${canonicalPath === "/" ? "" : canonicalPath}` : canonicalPath;
  return {
    title: {
      default: AEAC_NAME,
      template: `%s · ${AEAC_NAME}`,
    },
    description: aeacDefinition,
    robots: { index: true, follow: true },
    alternates: { canonical },
    icons: {
      icon: "/election-advisory/aeac-diamond.svg",
      apple: "/election-advisory/aeac-seal.svg",
    },
    openGraph: {
      title: AEAC_NAME,
      description: aeacDefinition,
      url: canonical,
      siteName: AEAC_PUBLIC_DOMAIN,
      images: [{ url: "/election-advisory/aeac-seal.svg", alt: AEAC_NAME }],
    },
  };
}

export default function ElectionAdvisoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`aeac-root ${serif.variable} ${sans.variable}`}>
      <CommissionShell>{children}</CommissionShell>
    </div>
  );
}
