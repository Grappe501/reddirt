import Link from "next/link";
import { CandidateEncounterScenariosPanel } from "@/components/admin/intelligence/CandidateEncounterScenariosPanel";
import { Phase16P2UpgradePassPanel } from "@/components/admin/intelligence/Phase16P2UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P2UpgradePass } from "@/lib/intelligence/v4/phase16P2Closure";
import {
  getEncounterScenario,
  getEncounterScenarioSteps,
  listEncounterScenarios,
  resolveEncounterScenarioId,
} from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import { recordEncounterProgress } from "@/lib/intelligence/v4/phase16P6SessionMemory";

export const dynamic = "force-dynamic";

export default async function EncountersHubPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;
  const scenarioId = resolveEncounterScenarioId(params.scenario);
  recordEncounterProgress(scenarioId, 1);
  const report = computePhase16P2UpgradePass();
  const scenarios = listEncounterScenarios();
  const activeScenario = getEncounterScenario(scenarioId)!;
  const steps = getEncounterScenarioSteps(scenarioId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P2"
        title="Encounter scenarios"
        description="Four runnable scenarios — ACCA panel, three-way debate, clerk 1:1, purchase walkthrough — each binds existing prep depth with evidence honesty gates."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher
        </Link>
        <Link
          href="/admin/intelligence/run-of-show"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Run-of-show presets
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P2UpgradePassPanel report={report} compact />

      <CandidateEncounterScenariosPanel scenarios={scenarios} steps={steps} activeScenario={activeScenario} />
    </div>
  );
}
