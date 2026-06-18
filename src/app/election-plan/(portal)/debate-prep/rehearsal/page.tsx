import { CandidateDrillQueueStrip } from "@/components/admin/intelligence/CandidateDrillQueueStrip";
import { CandidateEncounterScenariosStrip } from "@/components/admin/intelligence/CandidateEncounterScenariosStrip";
import { CandidateIpadDrillPlayerStrip } from "@/components/admin/intelligence/CandidateIpadDrillPlayerStrip";
import { CandidateRehearsalLauncherStrip } from "@/components/admin/intelligence/CandidateRehearsalLauncherStrip";
import { CandidateRunOfShowStrip } from "@/components/admin/intelligence/CandidateRunOfShowStrip";
import { CandidateSessionDebriefStrip } from "@/components/admin/intelligence/CandidateSessionDebriefStrip";
import { CandidateSreClosureStrip } from "@/components/admin/intelligence/CandidateSreClosureStrip";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { buildDebatePrepCommandHomeBundle } from "@/lib/election-plan/debate-prep-system-v5";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rehearsal Engine | Debate Prep | Election Plan",
  description: "SRE stage rehearsal — encounters, drill queue, run of show, and iPad drill player.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepRehearsalPage() {
  const { feed, sreClosure } = buildDebatePrepCommandHomeBundle();

  return (
    <>
      <div className="ep-classification">Internal · Rehearsal engine · Debate prep v5</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Phase 16 · SRE rehearsal</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Rehearsal &amp; drill queue</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Stage rehearsal engine — encounters, run of show, drill cards, and iPad player. Run tonight&apos;s primary
              encounter first, then debrief.
            </p>
          </header>

          <div className="space-y-4">
            <CandidateRehearsalLauncherStrip summary={feed.rehearsalLauncher} />
            <CandidateRunOfShowStrip summary={feed.runOfShow} />
            <CandidateEncounterScenariosStrip summary={feed.encounterScenarios} />
            <CandidateDrillQueueStrip summary={feed.drillQueue} />
            <CandidateSessionDebriefStrip summary={feed.sessionDebrief} />
            <CandidateIpadDrillPlayerStrip summary={feed.ipadDrillPlayer} />
            {sreClosure ? <CandidateSreClosureStrip summary={sreClosure} /> : null}
          </div>
        </div>
      </div>
    </>
  );
}
