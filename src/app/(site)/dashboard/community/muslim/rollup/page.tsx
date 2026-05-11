import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";
import { TwentySquareProgress } from "@/components/dashboard/vos/TwentySquareProgress";
import { MUSLIM_ROLLUP_TWENTY_SQUARE_SEED } from "@/lib/campaign-ops/muslim-community-dashboard-plan";
import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export const metadata: Metadata = {
  title: "Muslim Community Region · Rollup",
  description: "Region lane momentum — demo 20-square rollup until live KPI aggregates ship.",
};

export default function MuslimCommunityRollupPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Rollup KPIs</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Aggregate view across P5/VR, Events, Social, Youth Outreach, Women&apos;s Outreach, mosque polling readiness, and
          cross-lane coordination — reported upstream without double-counting. Numbers below are{" "}
          <span className="font-semibold text-kelly-deep">illustrative</span> until region metrics connect to the data layer.
        </p>
        <div className="mt-6 space-y-5 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-sm">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/55">Lane momentum · 20-square</p>
          {MUSLIM_ROLLUP_TWENTY_SQUARE_SEED.map((row) => (
            <TwentySquareProgress key={row.id} label={row.label} percent={row.percent} />
          ))}
        </div>
        <p className="mt-6 font-body text-xs text-kelly-text/65">
          Geographic team dashboards reuse the same 20-square visual system — e.g. demo triad{" "}
          <Link href={`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}`} className="font-semibold text-kelly-blue underline">
            open team workspace
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
