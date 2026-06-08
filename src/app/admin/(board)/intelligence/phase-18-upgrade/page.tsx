import Link from "next/link";
import { Phase18UpgradePassPanel } from "@/components/admin/intelligence/Phase18UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase18Bar,
  computePhase18UpgradePass,
  SEARCH_AI_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase18SearchAiProfessorClosure";
import { PHASE18_CHECKPOINT_IDS } from "@/lib/intelligence/v4/phase18SearchAiProfessorDepth";
import { INTEL_SEARCH_V5_VERSION } from "@/lib/intelligence/intelligenceSearchV5";
import { DEBATE_PREP_TUTOR_V2_VERSION } from "@/lib/intelligence/v4/debatePrepProfessorOrchestrator";

export const dynamic = "force-dynamic";

export default function Phase18UpgradePage() {
  const report = computePhase18UpgradePass();
  const bar = assertPhase18Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence upgrade · Phase 18 · ${INTEL_SEARCH_V5_VERSION}`}
        title="Search v5 + debate prep professor v2"
        description="Collegiate professor depth: seminar briefs with evidence tiers and Socratic questions; tutor v2 with office hours, moot court, and forensic rubric grading."
      >
        <V4BackLinks />
        <Link
          href={SEARCH_AI_PREP_HUB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Search & AI prep hub
        </Link>
      </V4PageHeader>

      <Phase18UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Versions</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Search</dt>
            <dd className="font-bold text-kelly-navy">{INTEL_SEARCH_V5_VERSION}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Debate prep tutor</dt>
            <dd className="font-bold text-kelly-navy">{DEBATE_PREP_TUTOR_V2_VERSION}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 18 bar met — ready for main merge" : bar.message}
        </p>
        {!bar.ok ? (
          <ul className="mt-3 list-inside list-disc text-sm text-kelly-muted">
            {PHASE18_CHECKPOINT_IDS.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
