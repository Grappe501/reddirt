/**
 * Homepage section orchestrator — LIVE CANON shell for `/`.
 *
 * Landing stays lean: one opening impression + one closing ask.
 * Full sections live on their menu homes — do not remount them here:
 * Meet Kelly → /about · Office → /understand · News → /from-the-road ·
 * Events → /events · Journey / Across Arkansas → /about/journey ·
 * Photos → /campaign-photos · Videos → /kelly-speaks · Endorsements → /endorsements
 */
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelFinalActionSection } from "@/components/home/trust-funnel/TrustFunnelFinalActionSection";

export function HomeTrustFunnelWireframe() {
  return (
    <div className="bg-white">
      <TrustFunnelHero />
      <TrustFunnelFinalActionSection />
    </div>
  );
}
