import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";

export const metadata: Metadata = {
  title: "Muslim Community Region · Mosque polling readiness",
  description: "Faith-venue polling site planning — neutral public process, counsel and clerk coordination.",
};

export default function MuslimCommunityMosquePollingPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Mosque polling location readiness</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Polling-site planning uses a neutral, law-first process: stakeholder alignment, county clerk and election-board
          coordination, access and ADA considerations, and counsel-reviewed public language. Facility use is a polling{" "}
          <span className="italic">site</span> under law — not a religious endorsement. Coordinate turnout education with Youth and
          Women&apos;s lanes using community-approved messaging.
        </p>
        <p className="mt-4 rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] px-4 py-3 font-body text-sm text-kelly-text/85">
          Staff workflow template:{" "}
          <code className="rounded bg-kelly-text/10 px-1 text-xs">s4_event_faith_venue_polling_v1</code> in Calendar HQ (apply to a
          meeting-type event after seed/deploy).{" "}
          <Link href="/admin/campaign-ops/community-equity" className="font-semibold text-kelly-blue underline">
            Open community equity hub
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
