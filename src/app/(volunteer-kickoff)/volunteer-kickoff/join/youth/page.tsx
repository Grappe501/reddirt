import { Suspense } from "react";
import { KickoffSignupForm } from "@/components/volunteer-kickoff/KickoffSignupForm";

export default function KickoffJoinYouthPage() {
  return (
    <Suspense fallback={<p className="font-body">Loading form…</p>}>
      <KickoffSignupForm
        pathway="youth"
        title="Arkansas Youth Coalition"
        intro="Join as a young Arkansan (16–24), refer someone, or offer adult support for the coalition."
      />
    </Suspense>
  );
}
