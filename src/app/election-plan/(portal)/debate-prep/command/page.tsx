import { CandidateCommandHomePanel } from "@/components/admin/intelligence/CandidateCommandHomePanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { buildDebatePrepCommandHomeBundle } from "@/lib/election-plan/debate-prep-system-v5";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Command Home | Debate Prep | Election Plan",
  description: "Tonight's readiness briefing — safe lines, blocked lines, and top-tier prep.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepCommandPage() {
  const { feed, cceClosure, sreClosure } = buildDebatePrepCommandHomeBundle();

  return (
    <>
      <div className="ep-classification">Internal · Command home · Debate prep v5</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Phase 15 · command home</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Tonight&apos;s command briefing</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              One screen — readiness, safe lines, blocked lines, and today&apos;s focus. Supreme workbench depth stays on
              staff admin profile.
            </p>
          </header>

          <CandidateCommandHomePanel feed={feed} cceClosure={cceClosure} sreClosure={sreClosure} resolveHref={mapAdminHrefToElectionPlan} />
        </div>
      </div>
    </>
  );
}
