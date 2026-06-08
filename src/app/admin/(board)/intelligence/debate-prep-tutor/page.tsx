import Link from "next/link";
import { DebatePrepTutorClient } from "@/components/admin/intelligence/DebatePrepTutorClient";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEBATE_PREP_TUTOR_HUB_HREF } from "@/lib/intelligence/v4/debatePrepTutorPackage";
import { DEBATE_PREP_TUTOR_V5_VERSION, TUTOR_HUB_WELCOME } from "@/lib/intelligence/v4/debatePrepTutorGuideV5";

export const dynamic = "force-dynamic";

export default function DebatePrepTutorPage() {
  return (
    <div className="mx-auto max-w-3xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence · ${DEBATE_PREP_TUTOR_V5_VERSION}`}
        title="Debate prep coach"
        description={TUTOR_HUB_WELCOME.intro}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/search-ai-prep-hub"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Search & AI prep hub
        </Link>
        <Link
          href="/admin/intelligence/kelly-debate-coaching"
          className="rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Coaching scripts
        </Link>
      </V4PageHeader>

      <DebatePrepTutorClient />

      <section className="mt-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">How to talk with the tutor (v5)</h2>
        <p className="mt-2 leading-relaxed text-kelly-muted">{TUTOR_HUB_WELCOME.howToStart}</p>
        <ol className="mt-4 list-inside list-decimal space-y-3 text-kelly-muted">
          <li>
            <strong>Pick by clock, not ego.</strong> Panic mode exists because browsing raises adrenaline. Professor
            modes exist because some nights you need the why before the line.
          </li>
          <li>
            <strong>Follow the path in order.</strong> Each session shows numbered steps — opening, cards, optional
            tools, practice feedback, close. Skipping trap warnings is how agree-only closes sneak on stage.
          </li>
          <li>
            <strong>Read coach turns out loud.</strong> The italic Socratic question is what you&apos;d ask yourself
            backstage. Answer it before tapping Next tip.
          </li>
          <li>
            <strong>Practice box = muscle memory.</strong> Type what you&apos;d actually say. Coach or professor
            feedback flags blocked language, unsourced stats, and structure gaps.
          </li>
          <li>
            <strong>Tools are drafts, not scripts.</strong> Packo advisor, direct democracy, CMR — run when the card
            calls for it; staff verifies before anything goes on stage.
          </li>
        </ol>
        <p className="mt-4 text-[10px] font-bold uppercase text-amber-900">{TUTOR_HUB_WELCOME.governance}</p>
        <p className="mt-2 text-[10px] text-kelly-subtle">Hub: {DEBATE_PREP_TUTOR_HUB_HREF}</p>
      </section>
    </div>
  );
}
