import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";

export const metadata: Metadata = {
  title: "Muslim Community Region · Events",
  description: "Community gatherings, registration drives, and family-friendly programming.",
};

export default function MuslimCommunityEventsPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Events</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Community gatherings, registration drives, and family-forward programming — coordinated with the campaign Events
          lead. The Women&apos;s Outreach lane helps ensure timing, childcare context, and settings that work for families. One
          coherent calendar avoids competing duplicate asks across lanes.
        </p>
        <p className="mt-4 font-body text-sm text-kelly-text/85">
          Public onboarding:{" "}
          <Link href="/volunteer" className="font-semibold text-kelly-blue underline">
            /volunteer
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
