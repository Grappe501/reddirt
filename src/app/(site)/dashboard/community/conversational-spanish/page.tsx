import type { Metadata } from "next";
import Link from "next/link";

import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { CountyRegistrationGoalCard } from "@/components/dashboard/vos/CountyRegistrationGoalCard";

export const metadata: Metadata = {
  title: "Conversational Spanish · Community region",
  description: "Spanish-first civic organizing hub — expanding after campaign and community review.",
};

export default function ConversationalSpanishOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <CampaignCountdown variant="compact" className="h-full" />
        <CountyRegistrationGoalCard mode="community" className="h-full" />
      </div>

      <div className="space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
        <p className="font-body text-sm text-kelly-text/85">
          This region reserves space for Spanish-first civic organizing — same triad discipline as geographic teams (Events · Social ·
          Power of 5 / VR). Lane modules and KPIs grow once the Muslim Community hub reaches partner-ready quality and this region
          clears community review.
        </p>
        <p className="font-body text-sm text-kelly-text/75">
          <Link href="/dashboard/field" className="font-semibold text-kelly-blue underline">
            Field Director dashboard
          </Link>
          {" · "}
          <Link href="/dashboard/community/muslim" className="font-semibold text-kelly-blue underline">
            Muslim Community dashboard
          </Link>
          {" · "}
          <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
            Volunteer resources
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
