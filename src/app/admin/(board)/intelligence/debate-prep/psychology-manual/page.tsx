import Link from "next/link";
import { V4DebatePsychologyManualHub } from "@/components/admin/intelligence/v4/V4DebatePsychologyManualPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEBATE_PSYCHOLOGY_MANUAL_SUMMARY, DEBATE_PSYCHOLOGY_MANUAL_TITLE } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Debate Philosophy, Psychology, and Atmosphere — full training manual for Arkansas SOS debates. */
export default function DebatePsychologyManualPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · psychology & atmosphere"
        title={DEBATE_PSYCHOLOGY_MANUAL_TITLE}
        description={DEBATE_PSYCHOLOGY_MANUAL_SUMMARY}
        guide={getSurfaceGuide("debate-briefings-index")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Philosophy briefings
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Debate prep packet
        </Link>
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Expected questions
        </Link>
      </V4PageHeader>

      <article className="mb-8 rounded-xl border-2 border-kelly-gold/40 bg-amber-50/40 p-5 text-sm">
        <p className="font-bold uppercase text-amber-950">How to use this manual</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Read one section per prep day before SOS question drills — philosophy before policy detail.</li>
          <li>Rehearse scripts aloud on video; mute audio and check atmosphere (Teacher · Neighbor · Mother · Executive · Reformer).</li>
          <li>Open linked opponent dossiers and trap lanes when a section names Hammer or Pakko psychology.</li>
          <li>Return to Part 16 (five messages) and Part 19 (Kelly archetype) before every stage walk-on.</li>
          <li>Finish at claims gate before using any statistic or bill citation on air.</li>
        </ol>
      </article>

      <V4DebatePsychologyManualHub />
    </div>
  );
}
