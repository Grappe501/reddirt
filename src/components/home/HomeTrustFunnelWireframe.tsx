/**
 * Homepage section orchestrator — LIVE CANON shell for `/`
 * (KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 narrative order).
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
 *
 * Upper stack stays on `/`: hero → Government That Works → primary message →
 * personality still bridge → closing ask.
 *
 * Do not remount menu homes below the bridge:
 * Meet Kelly story → /about · Journey / Across Arkansas → /about/journey ·
 * Photos → /campaign-photos · News → /from-the-road · Events → /events ·
 * Endorsements → /endorsements · Videos library → /kelly-speaks
 */
import { TrustFunnelFourPillarsSection } from "@/components/home/trust-funnel/TrustFunnelFourPillarsSection";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelPrimaryMessageSection } from "@/components/home/trust-funnel/TrustFunnelPrimaryMessageSection";
import { TrustFunnelFinalActionSection } from "@/components/home/trust-funnel/TrustFunnelFinalActionSection";
import { PublicMediaSlotFrame } from "@/components/media/PublicMediaSlotFrame";

/**
 * Soft visual bridge after the primary message —
 * typed public personality still (not a Meet Kelly remount / not memoir).
 */
function HomePersonalityMediaBridge() {
  return (
    <div
      className="relative isolate h-[min(38vw,16rem)] w-full overflow-hidden border-y border-kelly-ink/8 sm:h-[min(32vw,18rem)]"
      aria-hidden
    >
      <PublicMediaSlotFrame
        slotKey="home.personality.primary"
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        warmOverlay
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-white/15 to-white"
        aria-hidden
      />
    </div>
  );
}

export function HomeTrustFunnelWireframe() {
  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelFourPillarsSection />

      <TrustFunnelPrimaryMessageSection />

      <HomePersonalityMediaBridge />

      <TrustFunnelFinalActionSection />
    </div>
  );
}
