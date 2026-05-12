import type { Metadata } from "next";
import Link from "next/link";

import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";
import { CountyRegistrationGoalCard } from "@/components/dashboard/vos/CountyRegistrationGoalCard";
import {
  MUSLIM_CROSS_LANE_COORDINATION,
  MUSLIM_REGION_LEADERSHIP_MODEL,
} from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Muslim Community Region · Overview",
  description: "Community region dashboard — leadership model and cross-lane coordination; partner review where noted.",
};

export default function MuslimCommunityOverviewPage() {
  return (
    <div className="space-y-8">
      <MuslimCommunityReviewBanner />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <CampaignCountdown variant="compact" className="h-full" />
        <CountyRegistrationGoalCard mode="community" className="h-full" />
      </div>

      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Leadership structure</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Coordinators mirror how Muslim communities actually organize: an overall lead supported by lane leads aligned with the
          statewide Volunteer Operating System.
        </p>
        <div className="mt-4 rounded-xl border border-kelly-text/10 bg-white p-4 font-mono text-xs leading-relaxed text-kelly-deep">
          <p className="mb-2 font-body text-[10px] font-bold uppercase text-kelly-text/50">{MUSLIM_REGION_LEADERSHIP_MODEL.title}</p>
          {MUSLIM_REGION_LEADERSHIP_MODEL.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Reporting and escalation</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {MUSLIM_REGION_LEADERSHIP_MODEL.reporting.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-6">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Cross-lane coordination</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/85">{MUSLIM_CROSS_LANE_COORDINATION.intro}</p>
        <ul className="mt-4 space-y-3">
          {MUSLIM_CROSS_LANE_COORDINATION.rows.map((row) => (
            <li key={row.from + row.to} className="rounded-lg border border-kelly-text/10 bg-white px-4 py-3 font-body text-sm text-kelly-text/85">
              <span className="font-bold text-kelly-navy">{row.from}</span>
              <span className="text-kelly-text/50"> → </span>
              <span className="font-bold text-kelly-navy">{row.to}</span>
              <span className="mt-1 block text-kelly-text/75">{row.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/dashboard/field" className="font-semibold text-kelly-blue underline">
          Field Director dashboard
        </Link>{" "}
        ·{" "}
        <Link href="/volunteer/resources/muslim-community" className="font-semibold text-kelly-blue underline">
          Volunteer resource hub (Muslim Community)
        </Link>
        . Use the tabs above for day-to-day lane work; this overview stays the leadership map.
      </p>

      <p className="font-body text-xs text-kelly-text/55">
        Staff:{" "}
        <Link href="/admin/campaign-ops/community-equity" className="font-semibold text-kelly-blue underline">
          Community equity hub
        </Link>
        .
      </p>
    </div>
  );
}
