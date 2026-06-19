import Link from "next/link";

import { ForumTranscriptIntelHubPanel } from "@/components/election-plan/ForumTranscriptIntelHubPanel";
import { DebatePrepTutorClient } from "@/components/admin/intelligence/DebatePrepTutorClient";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { EP_DEBATE_PREP_REHEARSAL_HREF, EP_DEBATE_PREP_TUTOR_API } from "@/lib/election-plan/debate-prep-links";
import { buildDebatePrepSystemV6Snapshot } from "@/lib/election-plan/debate-prep-system-v6";
import { DEBATE_PREP_TUTOR_V5_VERSION, TUTOR_HUB_WELCOME } from "@/lib/intelligence/v4/debatePrepTutorGuideV5";
import { PROFESSOR_SHOWCASE_V6_VERSION } from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";

export const metadata = {
  title: "AI Debate Prep Tutor | Debate Prep | Election Plan",
  description: "Conversational coach and professor modes for SOS debate rehearsal.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepTutorPage() {
  const snapshot = buildDebatePrepSystemV6Snapshot();

  return (
    <>
      <div className="ep-classification">Internal · AI tutor · Debate prep v5</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              {DEBATE_PREP_TUTOR_V5_VERSION} · {PROFESSOR_SHOWCASE_V6_VERSION}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Debate prep seminar</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{TUTOR_HUB_WELCOME.intro}</p>
          </header>

          <ForumTranscriptIntelHubPanel intel={snapshot.forumIntel} compact />

          <DebatePrepTutorClient embedded apiBase={EP_DEBATE_PREP_TUTOR_API} />

          <section className="ep-card mt-8 p-5 text-sm">
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">How to talk with the tutor (v5)</h2>
            <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{TUTOR_HUB_WELCOME.howToStart}</p>
            <p className="mt-4 text-[10px] font-bold uppercase text-amber-900">{TUTOR_HUB_WELCOME.governance}</p>
            <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
              Need the full admin drill queue?{" "}
              <Link href={EP_DEBATE_PREP_REHEARSAL_HREF} className="font-semibold underline">
                Drill queue &amp; rehearsal →
              </Link>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
