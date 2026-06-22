import Link from "next/link";

import { AccaForumLocalRecordingPanel } from "@/components/election-plan/AccaForumLocalRecordingPanel";
import { AccaForumYoutubeEmbed } from "@/components/election-plan/AccaForumYoutubeEmbed";
import { ElectionPlanDay4PathwayReturnLink } from "@/components/election-plan/ElectionPlanDay4ForumPanels";
import { ForumTranscriptLabClient } from "@/components/admin/intelligence/ForumTranscriptLabClient";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";
import { EP_FORUM_TRANSCRIPT_LAB_API } from "@/lib/election-plan/debate-prep-links";
import {
  EP_FORUM_LAB_ANALYSIS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_LAB_PREDICTED_SCRIPT_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { ACCA_2026_SOS_FORUM_DROP_REL, ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forum Transcript Lab | Debate Prep | Election Plan",
  description: "Upload the three-candidate ACCA forum, transcribe with AI, and build Kelly's capitalize playbook.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanForumTranscriptLabPage() {
  const record = loadForumTranscriptLab();

  return (
    <>
      <div className="ep-classification">Internal · Forum transcript lab · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Day 4 · forum intelligence</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Forum transcript lab</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Upload the three-candidate forum video, transcribe with AI, and build Kelly&apos;s capitalize playbook for the
              SOS debate.
            </p>
            <div className="mt-3">
              <ElectionPlanDay4PathwayReturnLink blockId="b4-lab" label="Return to Day 4 forum lab block" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <Link
                href={EP_FORUM_LAB_INTEGRATION_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                7-day integration map →
              </Link>
              <Link
                href={EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                Current election law study →
              </Link>
              <Link
                href={EP_FORUM_LAB_ANALYSIS_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                Forum analysis lessons →
              </Link>
              <Link
                href={EP_FORUM_LAB_CAPITALIZE_MOVES_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                Capitalize moves →
              </Link>
              <Link
                href={EP_FORUM_LAB_DEEP_ANALYSIS_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                Deep analysis v2 →
              </Link>
              <Link
                href={EP_FORUM_LAB_PREDICTED_SCRIPT_HREF}
                className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
              >
                Predicted script →
              </Link>
            </div>
          </header>

          <AccaForumYoutubeEmbed />

          <AccaForumLocalRecordingPanel record={record} apiBase={EP_FORUM_TRANSCRIPT_LAB_API} />

          <section className="ep-card mb-8 border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4 text-sm">
            <p className="font-semibold text-[var(--ep-navy)]">Large MP4 (e.g. 7.5 GB ACCA panel)</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              Drop the file in{" "}
              <code className="rounded bg-white px-1 text-[11px]">RedDirt/{ACCA_2026_SOS_FORUM_DROP_REL.replace(/\\/g, "/")}/</code>{" "}
              then run <code className="rounded bg-white px-1">npm run forum:ingest-acca-drop</code> from RedDirt. Event:{" "}
              {ACCA_2026_SOS_FORUM_EVENT.date} · {ACCA_2026_SOS_FORUM_EVENT.candidates.join(" · ")}.
            </p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              After ingest, refresh this page — transcript and analysis appear here for staff and Executive Book crosswalk.
            </p>
          </section>

          <ForumTranscriptLabClient
            initialRecord={record}
            openaiConfigured={isOpenAIConfigured()}
            apiBase={EP_FORUM_TRANSCRIPT_LAB_API}
            surface="election-plan"
          />

          <p className="mt-8 text-xs text-[var(--ep-navy-muted)]">
            Transcript output feeds{" "}
            <Link href="/election-plan/executive-book" className="font-semibold underline">
              Executive Book
            </Link>{" "}
            and county workbench debate prep as those surfaces ship.
          </p>
        </div>
      </div>
    </>
  );
}
