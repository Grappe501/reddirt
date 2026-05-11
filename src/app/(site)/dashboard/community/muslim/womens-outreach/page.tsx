import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";
import { MUSLIM_WOMENS_OUTREACH_LANE } from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Muslim Community Region · Women's Outreach",
  description: "Women's networks and family-forward civic outreach — draft pending community review.",
};

export default function MuslimCommunityWomensPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Women&apos;s Outreach</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          <span className="font-semibold text-kelly-deep">Purpose: </span>
          {MUSLIM_WOMENS_OUTREACH_LANE.purpose}
        </p>
        <div className="mt-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Women&apos;s Outreach Lead — responsibilities</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {MUSLIM_WOMENS_OUTREACH_LANE.responsibilities.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Lane scorecard (KPIs)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {MUSLIM_WOMENS_OUTREACH_LANE.kpis.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 font-body text-sm text-kelly-text/75">
          Draft resource outlines:{" "}
          <Link href="/volunteer/resources/muslim-community#womens-outreach" className="font-semibold text-kelly-blue underline">
            Resource hub — Women&apos;s Outreach section
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
