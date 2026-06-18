import Link from "next/link";
import { DebateWeekIntensivePanel } from "@/components/admin/intelligence/DebateWeekIntensivePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  DEBATE_DATE,
  DEBATE_WEEK_INTENSIVE_HUB_HREF,
  DEBATE_WEEK_INTENSIVE_PRIMER,
  FORUM_TRANSCRIPT_LAB_HREF,
  totalIntensiveMinutes,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export default function DebateWeekIntensiveHubPage() {
  const referenceDate = process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  const totalHours = Math.round((totalIntensiveMinutes() / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Command Mode"
        title="Debate week intensive prep"
        description={`${DEBATE_WEEK_INTENSIVE_PRIMER.headline} · ${totalHours}h structured · Debate ${DEBATE_DATE} Eureka Springs.`}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Command home
        </Link>
        <Link
          href={FORUM_TRANSCRIPT_LAB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Forum transcript lab
        </Link>
        <Link
          href="/admin/intelligence/debate-prep-tutor"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          AI tutor
        </Link>
      </V4PageHeader>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-kelly-gold/30 bg-kelly-gold/5 p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Opponents</p>
          <p className="mt-2 text-kelly-text">{DEBATE_WEEK_INTENSIVE_PRIMER.opponents}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-emerald-900">Newspaper hook</p>
          <p className="mt-2 text-kelly-text">{DEBATE_WEEK_INTENSIVE_PRIMER.newspaperHook}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-indigo-900">Legacy 7-day path</p>
          <p className="mt-2 text-kelly-muted">Phase 15 prep week still available for drill-down links.</p>
          <Link href="/admin/intelligence/kelly-prep-week" className="mt-2 inline-block text-xs font-bold underline">
            Kelly prep week →
          </Link>
        </div>
      </section>

      <DebateWeekIntensivePanel todayDate={referenceDate} />
    </div>
  );
}

export { DEBATE_WEEK_INTENSIVE_HUB_HREF };
