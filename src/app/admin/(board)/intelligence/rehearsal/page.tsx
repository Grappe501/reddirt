import Link from "next/link";
import { CandidateRehearsalLauncherPanel } from "@/components/admin/intelligence/CandidateRehearsalLauncherPanel";
import { Phase16P0UpgradePassPanel } from "@/components/admin/intelligence/Phase16P0UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P0UpgradePass } from "@/lib/intelligence/v4/phase16P0Closure";
import {
  buildRehearsalSession,
  buildTonightRehearsalOptions,
  getDefaultRunOfShowSteps,
  type RehearsalEncounterId,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export const dynamic = "force-dynamic";

const VALID_ENCOUNTERS = new Set<RehearsalEncounterId>([
  "debate-prep",
  "acca-panel",
  "clerk-meeting",
  "purchase-walkthrough",
]);

function resolveEncounterId(raw: string | undefined): RehearsalEncounterId {
  if (raw && VALID_ENCOUNTERS.has(raw as RehearsalEncounterId)) {
    return raw as RehearsalEncounterId;
  }
  return "debate-prep";
}

export default async function RehearsalHubPage({
  searchParams,
}: {
  searchParams: Promise<{ encounter?: string }>;
}) {
  const params = await searchParams;
  const encounterId = resolveEncounterId(params.encounter);
  const report = computePhase16P0UpgradePass();
  const encounters = buildTonightRehearsalOptions();
  const session = buildRehearsalSession(encounterId);
  const steps =
    encounterId === "purchase-walkthrough"
      ? getDefaultRunOfShowSteps("debate-prep")
      : getDefaultRunOfShowSteps(encounterId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P0"
        title="Session launcher"
        description="Pick tonight's encounter and run the timed run-of-show — each step deep-links into existing prep surfaces, not new content silos."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Trap lanes
        </Link>
        <Link
          href="/admin/intelligence/run-of-show"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Run-of-show presets
        </Link>
        <Link
          href="/admin/intelligence/encounters"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Encounter scenarios
        </Link>
      </V4PageHeader>

      <Phase16P0UpgradePassPanel report={report} compact />

      {encounterId === "purchase-walkthrough" ? (
        <section className="mb-6 rounded-xl border border-teal-200 bg-teal-50/40 p-4 text-sm text-teal-950">
          <p className="font-bold">Purchase walkthrough routes to demo-mode script.</p>
          <Link href="/admin/intelligence/demo-mode" className="mt-2 inline-block font-bold underline">
            Open demo-mode hub →
          </Link>
        </section>
      ) : (
        <section className="mb-6 rounded-xl border border-amber-100 bg-white p-5 text-sm">
          <p className="font-bold text-kelly-navy">{session.title}</p>
          <p className="mt-2 text-kelly-muted">
            {session.steps.length} steps · ~{session.durationMinutes} minutes · stage-safe gates on drill steps
          </p>
        </section>
      )}

      <CandidateRehearsalLauncherPanel
        encounters={encounters}
        steps={steps}
        activeEncounterTitle={session.title}
      />
    </div>
  );
}
