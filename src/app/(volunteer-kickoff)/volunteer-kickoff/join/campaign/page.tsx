import { Suspense } from "react";
import { KickoffSignupForm } from "@/components/volunteer-kickoff/KickoffSignupForm";

export default function KickoffJoinCampaignPage() {
  return (
    <Suspense fallback={<p className="font-body">Loading form…</p>}>
      <KickoffSignupForm
        pathway="campaign"
        title="Join a Statewide Campaign Team"
        intro="Choose the statewide team that fits your skills. We’ll follow up with the right coordinator."
      />
    </Suspense>
  );
}
