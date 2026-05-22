import { KELLY_SOS_DISPLAY_NAME, KELLY_CAMPAIGN_OS_TAGLINE } from "@/lib/campaign-tenancy/single-campaign-mode";

/** Primary operator-facing campaign identity (no multi-tenant switcher). */
export function KellySingleCampaignBadge() {
  return (
    <div className="mx-3 mb-2 rounded-xl border border-kelly-page/15 bg-kelly-page/5 px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-kelly-inverse-muted">Active campaign</p>
      <p className="mt-1 text-sm font-bold text-kelly-page">{KELLY_SOS_DISPLAY_NAME}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-kelly-inverse-muted">{KELLY_CAMPAIGN_OS_TAGLINE}</p>
    </div>
  );
}
