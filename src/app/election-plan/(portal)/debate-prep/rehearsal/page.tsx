import { Suspense } from "react";

import { CandidateDrillQueuePanel } from "@/components/admin/intelligence/CandidateDrillQueuePanel";
import { CandidateDrillQueueStrip } from "@/components/admin/intelligence/CandidateDrillQueueStrip";
import { CandidateEncounterScenariosStrip } from "@/components/admin/intelligence/CandidateEncounterScenariosStrip";
import { CandidateIpadDrillPlayerStrip } from "@/components/admin/intelligence/CandidateIpadDrillPlayerStrip";
import { CandidateRehearsalLauncherStrip } from "@/components/admin/intelligence/CandidateRehearsalLauncherStrip";
import { CandidateRunOfShowStrip } from "@/components/admin/intelligence/CandidateRunOfShowStrip";
import { CandidateSessionDebriefStrip } from "@/components/admin/intelligence/CandidateSessionDebriefStrip";
import { CandidateSreClosureStrip } from "@/components/admin/intelligence/CandidateSreClosureStrip";
import { ForumRehearsalIntelPanel } from "@/components/election-plan/ForumRehearsalIntelPanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { buildDebatePrepCommandHomeBundle, DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-system-v8";
import {
  EP_DRILL_QUEUE_HUB_HREF,
  getDrillQueue,
  getDrillQueueCards,
  listDrillQueues,
  resolveDrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rehearsal Engine | Debate Prep | Election Plan",
  description: "SRE stage rehearsal — encounters, drill queue, run of show, and iPad drill player.",
  robots: { index: false, follow: false },
};

export default async function ElectionPlanDebatePrepRehearsalPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; card?: string }>;
}) {
  const params = await searchParams;
  const { feed, sreClosure } = buildDebatePrepCommandHomeBundle();
  const queueId = resolveDrillQueueId(params.queue);
  const queues = listDrillQueues();
  const activeQueue = getDrillQueue(queueId)!;
  const cards = getDrillQueueCards(queueId);
  const showDrillPlayer = Boolean(params.queue || params.card || feed.drillQueue.forumQueueAvailable);

  return (
    <>
      <div className="ep-classification">Internal · Rehearsal engine · {DEBATE_PREP_PACKAGE_LABEL}</div>
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

          <ForumRehearsalIntelPanel />

          {showDrillPlayer ? (
            <div className="mb-8">
              <Suspense fallback={<p className="text-sm text-[var(--ep-navy-muted)]">Loading drill queue…</p>}>
                <CandidateDrillQueuePanel
                  queues={queues}
                  cards={cards}
                  activeQueue={activeQueue}
                  hubBaseHref={EP_DRILL_QUEUE_HUB_HREF}
                />
              </Suspense>
            </div>
          ) : null}

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
