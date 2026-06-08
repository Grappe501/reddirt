import Link from "next/link";
import { IntelligenceAgentCopilotDock } from "@/components/admin/intelligence/IntelligenceAgentCopilotDock";
import { DebatePrepTutorClient } from "@/components/admin/intelligence/DebatePrepTutorClient";
import { IntelligencePrepSearchBar } from "@/components/admin/intelligence/IntelligencePrepSearchBar";
import { Phase18UpgradePassPanel } from "@/components/admin/intelligence/Phase18UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase18UpgradePass } from "@/lib/intelligence/v4/phase18SearchAiProfessorClosure";
import { INTEL_SEARCH_V5_VERSION } from "@/lib/intelligence/intelligenceSearchV5";

export const dynamic = "force-dynamic";

export default function SearchAiPrepHubPage() {
  const report = computePhase18UpgradePass();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence · ${INTEL_SEARCH_V5_VERSION}`}
        title="Search & AI prep command hub"
        description="Professor-level search briefs, collegiate debate tutor, SRE shortcuts, and governed AI tools — Kelly-safe, stage-aware, human review required."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/phase-18-upgrade"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Phase 18 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase18UpgradePassPanel report={report} compact />

      <IntelligencePrepSearchBar variant="sticky" />

      <div className="mt-6">
        <IntelligenceAgentCopilotDock />
      </div>

      <div className="mt-8">
        <DebatePrepTutorClient embedded />
      </div>

      <section className="mt-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">How to use tonight</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Search first — Ctrl+K or the bar above. Press Enter for professor brief: thesis, evidence tiers, Socratic questions.</li>
          <li>Debate prep tutor below — office hours, seminar, moot court, or forensic rubric audit.</li>
          <li>Run matching AI prep tools from search results or the Tools tab below.</li>
          <li>Open SRE shortcuts for rehearsal session, drill queue, or live event countdown.</li>
          <li>Staff reviews all outputs before stage — nothing auto-publishes.</li>
        </ol>
      </section>
    </div>
  );
}
