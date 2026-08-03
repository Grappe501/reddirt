import { Suspense } from "react";
import { KickoffSignupForm } from "@/components/volunteer-kickoff/KickoffSignupForm";

export default function KickoffJoinMatchPage() {
  return (
    <Suspense fallback={<p className="font-body">Loading form…</p>}>
      <KickoffSignupForm
        pathway="match"
        title="Help Me Find My Place"
        intro="Share what you enjoy and how much time you can give. We’ll help match you to a role."
      />
    </Suspense>
  );
}
