import Link from "next/link";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEBATE_WEEK_INTENSIVE_HUB_HREF } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  CROSS_CUTTING_THEORY,
  DEBATE_INTENSIVE_V3_LABEL,
  DEBATE_WEEK_LANES_HUB_HREF,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";

export const dynamic = "force-dynamic";

const categoryLabel = {
  "command-mode": "Command Mode",
  psychology: "Psychology",
  "adult-education": "Adult education",
  "debate-craft": "Debate craft",
  media: "Media & newspapers",
  opponent: "Opponent dynamics",
} as const;

export default function DebateWeekTheoryHubPage() {
  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence · ${DEBATE_INTENSIVE_V3_LABEL}`}
        title="Theory library"
        description="Cross-cutting ideas behind the intensive — read any section when you want to understand why a block or lane exists, not just what to do."
      >
        <V4BackLinks />
        <Link
          href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Intensive hub
        </Link>
        <Link
          href={DEBATE_WEEK_LANES_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Drill-down lanes
        </Link>
      </V4PageHeader>

      <p className="mb-8 text-sm text-kelly-muted">
        Kelly has never debated on stage against career politicians. These primers explain the adult-education and
        performance science behind Command Mode — so drills feel purposeful, not arbitrary.
      </p>

      <div className="space-y-6">
        {CROSS_CUTTING_THEORY.map((t) => (
          <article key={t.id} className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">
              {categoryLabel[t.category]} · ~{t.readMinutes} min read
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{t.title}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-indigo-900">Theory</p>
                <p className="mt-1 leading-relaxed text-kelly-muted">{t.body}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-900">Why it matters for this race</p>
                <p className="mt-1 leading-relaxed text-kelly-muted">{t.whyItMatters}</p>
              </div>
              <div className="rounded-lg border border-kelly-gold/30 bg-kelly-gold/5 p-4">
                <p className="text-[10px] font-bold uppercase text-kelly-navy">Kelly — apply tonight</p>
                <p className="mt-1 font-medium text-kelly-text">{t.kellyApplication}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
