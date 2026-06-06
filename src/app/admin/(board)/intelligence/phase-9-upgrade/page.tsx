import Link from "next/link";
import {
  DebateCoachingRunbookPanel,
  Phase9KhWavePanel,
  Phase9OrchestrationGapsPanel,
  Phase9UpgradePassPanel,
} from "@/components/admin/intelligence/Phase9UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase9UpgradePass } from "@/lib/intelligence/v4/phase9DebateInstructionClosure";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase9UpgradePage() {
  const report = computePhase9UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 9"
        title="Dossier depth + debate instruction bridge"
        description="Second-wave dossier expansion wired into all 28 prep sections, six trap lanes, and 35 SOS questions — plus debate coaching runbook and orchestration gap tracker."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kelly-debate-coaching"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Debate coaching
        </Link>
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Dossier briefing book
        </Link>
        <Link
          href="/admin/intelligence/phase-8-upgrade"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Phase 8
        </Link>
      </V4PageHeader>

      <Phase9UpgradePassPanel report={report} />

      <Phase9OrchestrationGapsPanel report={report} />

      <DebateCoachingRunbookPanel />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Phase 9 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>
            2× dossier depth expansion — kellyDossierDepthExpansion, opponentDossierDepthExpansion,
            accaConferenceDepthExpansion merged at read time via applyDossierDepthExpansion.
          </li>
          <li>
            Debate instruction bridge — phase9DebateInstructionDepth overlays on all 28 prep sections, six trap lanes,
            and every SOS question category with dossier cross-links.
          </li>
          <li>Eight-step debate coaching operator runbook from T-14 through post-event Field Book promotion.</li>
          <li>Field Book article debate-instruction-bridge + canon binding on phase-9-upgrade.</li>
          <li>Final KH wave 4 — ai-suggestion-sandbox and ai-opposition-copilot promoted from staff-stub.</li>
        </ol>
      </section>

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Quick links — debate instruction surfaces</h2>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          <li>
            <Link href="/admin/intelligence/kim-hammer/debate-prep" className="font-semibold text-kelly-navy underline">
              28 prep drill-down sections
            </Link>
          </li>
          <li>
            <Link href="/admin/intelligence/trap-lanes" className="font-semibold text-kelly-navy underline">
              6 trap lanes with clerk-room scripts
            </Link>
          </li>
          <li>
            <Link href="/admin/intelligence/sos-debate-questions" className="font-semibold text-kelly-navy underline">
              35 SOS debate questions
            </Link>
          </li>
          <li>
            <Link href="/admin/intelligence/debate-command" className="font-semibold text-kelly-navy underline">
              Debate command center
            </Link>
          </li>
          <li>
            <Link href="/admin/intelligence/field-book/glossary" className="font-semibold text-kelly-navy underline">
              Debate glossary
            </Link>
          </li>
          <li>
            <Link href="/admin/intelligence/county-clerk-week/acca-summer-conference" className="font-semibold text-kelly-navy underline">
              ACCA panel prep
            </Link>
          </li>
        </ul>
      </section>

      <Phase9KhWavePanel />
    </div>
  );
}
