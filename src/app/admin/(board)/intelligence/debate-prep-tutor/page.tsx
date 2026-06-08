import Link from "next/link";
import { DebatePrepTutorClient } from "@/components/admin/intelligence/DebatePrepTutorClient";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEBATE_PREP_TUTOR_HUB_HREF } from "@/lib/intelligence/v4/debatePrepTutorPackage";

export const dynamic = "force-dynamic";

export default function DebatePrepTutorPage() {
  return (
    <div className="mx-auto max-w-3xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · AI debate prep tutor"
        title="Debate prep coach"
        description="Time-boxed political debate tutoring — trap pivots, SOS speak-order, Check My Record six-beat, practice critique. Built for when the clock is running out."
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
        <h2 className="font-heading text-lg font-bold text-kelly-navy">How the tutor works</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>
            <strong>Pick your time</strong> — 5 min panic picks one trap card; 15 min runs pre-stage tools; 30 min adds practice critique.
          </li>
          <li>
            <strong>One card at a time</strong> — coach walks trap chess, speak-order, agree+fresh-add. No browsing the full bank.
          </li>
          <li>
            <strong>Practice + feedback</strong> — type your answer; coach flags agree-only closes, unsourced stats, blocked lines.
          </li>
          <li>
            <strong>Special drills</strong> — Check My Record six-beat and Packo three-way dynamics built in.
          </li>
          <li>All outputs are internal drafts — staff verifies before stage.</li>
        </ol>
        <p className="mt-4 text-[10px] text-kelly-subtle">Hub: {DEBATE_PREP_TUTOR_HUB_HREF}</p>
      </section>
    </div>
  );
}
