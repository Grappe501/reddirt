/**
 * Public homepage `/` — LIVE CANON trust-funnel shell.
 * Keeps opening stack through primary message + personality still;
 * trail / Across Arkansas / photos / news remounts stay on their menu routes.
 * @see docs/website/HOMEPAGE_FORWARD_PLAN.md
 */
import type { Metadata } from "next";
import { HomeDonateFloatingGate } from "@/components/home/HomeDonateFloatingGate";
import { HomeTrustFunnelWireframe } from "@/components/home/HomeTrustFunnelWireframe";
import { siteConfig } from "@/config/site";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

/** Visit totals on this page come from the live ledger. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Home",
  description: siteConfig.description,
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

/** Slice 1: donate gate delayed for launch — opt-in only via env. */
function isHomeDonateFloatingGateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HOME_DONATE_FLOATING_GATE === "true";
}

export default function HomePage() {
  return (
    <>
      {isHomeDonateFloatingGateEnabled() ? <HomeDonateFloatingGate /> : null}
      <HomeTrustFunnelWireframe />
    </>
  );
}
