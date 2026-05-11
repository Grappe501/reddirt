import type { Metadata } from "next";
import Link from "next/link";

import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { CountyRegistrationGoalCard } from "@/components/dashboard/vos/CountyRegistrationGoalCard";

export const metadata: Metadata = {
  title: "Marshallese · Community region",
  description: "Scaffold dashboard — mirrors Muslim Community lanes when partner-ready.",
};

export default function MarshalleseOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <CampaignCountdown variant="compact" className="h-full" />
        <CountyRegistrationGoalCard mode="community" className="h-full" />
      </div>

      <div className="space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
        <p className="font-body text-sm text-kelly-text/85">
          Reserved for Northwest Arkansas and statewide Marshallese civic partners. Same Volunteer Operating System lane
          discipline; content, nomenclature, and KPIs require community leadership alignment before going beyond this scaffold.
        </p>
        <p className="font-body text-sm text-kelly-text/75">
          Staff:{" "}
          <Link href="/admin/campaign-ops/community-equity" className="font-semibold text-kelly-blue underline">
            Community equity hub
          </Link>
          . Reference:{" "}
          <Link href="/dashboard/community/muslim" className="font-semibold text-kelly-blue underline">
            Muslim Community dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
