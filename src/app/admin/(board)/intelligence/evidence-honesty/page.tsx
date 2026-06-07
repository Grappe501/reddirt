import Link from "next/link";
import { CandidateEvidenceHonestyPrepPanel } from "@/components/admin/intelligence/CandidateEvidenceHonestyPrepPanel";
import { Phase15P5UpgradePassPanel } from "@/components/admin/intelligence/Phase15P5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { listEvidenceHonestySurfaces } from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";
import { buildEvidenceHonestySummaryForRuntime } from "@/lib/intelligence/v4/phase15P5EvidenceHonestyRuntime";
import { computePhase15P5UpgradePass } from "@/lib/intelligence/v4/phase15P5Closure";

export const dynamic = "force-dynamic";

export default function EvidenceHonestyHubPage() {
  const report = computePhase15P5UpgradePass();
  const surfaces = listEvidenceHonestySurfaces();
  const summary = buildEvidenceHonestySummaryForRuntime();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P5"
        title="Evidence honesty"
        description="Unified VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE badges on film room, briefings, opposition, and rehearse surfaces — Kelly sees evidence tier before proof language."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Claims ledger
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P5UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-amber-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">
          {surfaces.length} tagged surfaces · {summary.filmDrillCount} film drills · {summary.nonStageSafeCount}{" "}
          non-stage-safe
        </p>
        <p className="mt-2 text-kelly-muted">{summary.tonightReminder}</p>
      </section>

      <CandidateEvidenceHonestyPrepPanel surfaces={surfaces} />
    </div>
  );
}
