import { MUSLIM_DASHBOARD_DRAFT_NOTICE } from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export function MuslimCommunityReviewBanner() {
  return (
    <div className="rounded-2xl border-2 border-kelly-gold/50 bg-kelly-gold/10 p-4 md:p-5">
      <p className="font-heading text-sm font-bold text-kelly-navy">Draft · Community review</p>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/90">{MUSLIM_DASHBOARD_DRAFT_NOTICE}</p>
    </div>
  );
}
