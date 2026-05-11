import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";
import { MUSLIM_YOUTH_OUTREACH_LANE } from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Muslim Community Region · Youth Outreach",
  description: "Youth and young adult civic engagement — draft pending community review.",
};

export default function MuslimCommunityYouthPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Youth Outreach</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          <span className="font-semibold text-kelly-deep">Purpose: </span>
          {MUSLIM_YOUTH_OUTREACH_LANE.purpose}
        </p>
        <div className="mt-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Youth Outreach Lead — responsibilities</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {MUSLIM_YOUTH_OUTREACH_LANE.responsibilities.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Lane scorecard (KPIs)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {MUSLIM_YOUTH_OUTREACH_LANE.kpis.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 font-body text-sm text-kelly-text/75">
          Statewide Youth lane patterns (for triads and campus rhythms):{" "}
          <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
            Volunteer resources
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
