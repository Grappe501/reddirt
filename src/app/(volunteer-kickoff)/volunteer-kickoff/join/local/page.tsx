import { Suspense } from "react";
import { KickoffSignupForm } from "@/components/volunteer-kickoff/KickoffSignupForm";

export default function KickoffJoinLocalPage() {
  return (
    <Suspense fallback={<p className="font-body">Loading form…</p>}>
      <KickoffSignupForm
        pathway="local"
        title="Join My Local Team"
        intro="Tell us where you live and how you want to help organize your city, county, campus, or region."
      />
    </Suspense>
  );
}
