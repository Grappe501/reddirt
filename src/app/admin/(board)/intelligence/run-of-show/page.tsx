import Link from "next/link";
import { CandidateRunOfShowPresetPanel } from "@/components/admin/intelligence/CandidateRunOfShowPresetPanel";
import { Phase16P1UpgradePassPanel } from "@/components/admin/intelligence/Phase16P1UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P1UpgradePass } from "@/lib/intelligence/v4/phase16P1Closure";
import {
  countPresetMinutes,
  getRunOfShowPreset,
  getRunOfShowStepsForPreset,
  listRunOfShowPresets,
  resolveRunOfShowPresetId,
} from "@/lib/intelligence/v4/phase16P1RunOfShow";

export const dynamic = "force-dynamic";

export default async function RunOfShowHubPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const params = await searchParams;
  const presetId = resolveRunOfShowPresetId(params.preset);
  const report = computePhase16P1UpgradePass();
  const presets = listRunOfShowPresets();
  const activePreset = getRunOfShowPreset(presetId)!;
  const steps = getRunOfShowStepsForPreset(presetId);
  const totalMinutes = countPresetMinutes(steps);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P1"
        title="Timed run-of-show"
        description="Four presets — 15, 30, 45, and 60 minutes — each step deep-links into existing prep surfaces with stage-safe gates on drills."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P1UpgradePassPanel report={report} compact />

      <section className="mb-6 rounded-xl border border-orange-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">{activePreset.title}</p>
        <p className="mt-2 text-kelly-muted">{activePreset.description}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          {steps.length} steps · ~{totalMinutes} minutes (target {activePreset.durationLabel})
        </p>
        <p className="mt-2 rounded-lg border border-orange-100 bg-orange-50/40 p-2 text-xs italic text-kelly-text">
          Kelly rule: {activePreset.kellyRule}
        </p>
      </section>

      <CandidateRunOfShowPresetPanel presets={presets} steps={steps} activePresetTitle={activePreset.title} />
    </div>
  );
}
