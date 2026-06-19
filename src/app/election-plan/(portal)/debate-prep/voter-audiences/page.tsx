import Link from "next/link";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { VoterAudienceModelsHubPanel } from "@/components/election-plan/voter-audience/VoterAudienceModelsHubPanel";
import { EP_DEBATE_PREP_HREF } from "@/lib/election-plan/debate-prep-links";

export const metadata = {
  title: "Voter audiences | Debate Prep",
  robots: { index: false, follow: false },
};

export default function VoterAudiencesHubPage() {
  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />
        <header className="mb-6">
          <Link href={EP_DEBATE_PREP_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Debate prep
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Who is in the room?</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Sixteen named Arkansans in Kelly&apos;s big tent — the characters in the audience when she speaks.
          </p>
        </header>
        <VoterAudienceModelsHubPanel />
      </div>
    </div>
  );
}
