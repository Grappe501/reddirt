/**
 * Homepage section orchestrator for `/`.
 * Approved narrative: hero → restore trust / office / My Plan cards / Arkansas elections →
 * primary message → personality still → closing ask.
 * Menu homes stay on their own routes (Meet Kelly, From the Road, Events, photos, videos).
 */
import { TrustFunnelApprovedBody } from "@/components/home/trust-funnel/TrustFunnelApprovedBody";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelPrimaryMessageSection } from "@/components/home/trust-funnel/TrustFunnelPrimaryMessageSection";
import { TrustFunnelFinalActionSection } from "@/components/home/trust-funnel/TrustFunnelFinalActionSection";
import { PublicMediaSlotFrame } from "@/components/media/PublicMediaSlotFrame";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { resolveSiteCopy } from "@/lib/site-edit/copy-overrides";
import { isSiteEditMode } from "@/lib/site-edit/edit-mode";

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

export async function HomeTrustFunnelWireframe() {
  const editing = await isSiteEditMode();
  const h = trustFunnelHomeCopy.hero;
  const copy = {
    brand: resolveSiteCopy("home.hero.brand", h.brand),
    office: resolveSiteCopy("home.hero.office", h.office),
    promise: resolveSiteCopy("home.hero.promise", h.promise),
    body: resolveSiteCopy("home.hero.body", h.body),
    ctaPrimary: resolveSiteCopy("home.hero.ctaPrimary", h.ctas[0].label),
    ctaSecondary: resolveSiteCopy("home.hero.ctaSecondary", h.ctas[1].label),
  };

  return (
    <div className="bg-white">
      <TrustFunnelHero editing={editing} copy={copy} />

      <TrustFunnelApprovedBody />

      <TrustFunnelPrimaryMessageSection />

      <HomePersonalityMediaBridge />

      <TrustFunnelFinalActionSection />
    </div>
  );
}
