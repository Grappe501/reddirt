import Link from "next/link";
import { Phase19UpgradePassPanel } from "@/components/admin/intelligence/Phase19UpgradePassPanel";
import { ShowcaseHeroBanner } from "@/components/admin/intelligence/v4/ProfessorSeminarShowcase";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase19Bar,
  computePhase19UpgradePass,
  SEARCH_AI_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase19ProfessorShowcaseClosure";
import { PROFESSOR_SHOWCASE_V6_VERSION } from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";

export const dynamic = "force-dynamic";

export default function Phase19UpgradePage() {
  const report = computePhase19UpgradePass();
  const bar = assertPhase19Bar();

  return (
    <div className="mx-auto max-w-5xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence upgrade · Phase 19 · ${PROFESSOR_SHOWCASE_V6_VERSION}`}
        title="Professor showcase v6 — cinematic seminar"
        description="Navy-gold seminar hall, per-mode skins, animated lecture panels, forensic rubric showcase, and search brief hero — built to be the most memorable upgrade yet."
      >
        <V4BackLinks />
        <Link
          href={SEARCH_AI_PREP_HUB_HREF}
          className="rounded-full border border-kelly-gold bg-kelly-navy px-3 py-1 text-xs font-bold text-white"
        >
          Search & AI prep hub
        </Link>
        <Link
          href="/admin/intelligence/debate-prep-tutor"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate prep tutor
        </Link>
      </V4PageHeader>

      <ShowcaseHeroBanner />
      <Phase19UpgradePassPanel report={report} />

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? bar.message : bar.message}
        </p>
        <p className="mt-4 text-sm text-kelly-muted">
          Run the full sandbox: <code className="rounded bg-kelly-page px-1.5 py-0.5 text-xs">npm run agents:test-sandbox-intelligence-suite</code>
        </p>
      </section>
    </div>
  );
}
