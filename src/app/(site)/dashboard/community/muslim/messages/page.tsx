import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";

export const metadata: Metadata = {
  title: "Muslim Community Region · Messages",
  description: "Messaging and escalation — authenticated threads tie to Volunteer OS accounts in a later release.",
};

export default function MuslimCommunityMessagesPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Messages</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Lane leads coordinate day-to-day questions through the Muslim Community Overall Lead. Escalate policy, legal, or
          high-sensitivity community dynamics to the Field Director and campaign counsel when needed.
        </p>
        <p className="mt-4 rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-4 py-3 font-body text-sm text-kelly-text/85">
          In-product message threads scoped to community-region membership are planned as the Volunteer OS authentication model
          matures (alongside geographic team dashboards). For partner meetings today, use the{" "}
          <Link href="/volunteer/resources/messaging" className="font-semibold text-kelly-blue underline">
            messaging resource library
          </Link>{" "}
          and your campaign point of contact.
        </p>
      </div>
    </div>
  );
}
