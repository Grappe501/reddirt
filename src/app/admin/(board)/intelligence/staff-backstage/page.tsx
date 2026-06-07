import Link from "next/link";
import { CandidateStaffBackstageGuardPanel } from "@/components/admin/intelligence/CandidateStaffBackstageGuardPanel";
import { Phase15P8UpgradePassPanel } from "@/components/admin/intelligence/Phase15P8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  buildStaffBackstageSummary,
  listStaffBackstageGuardSurfaces,
} from "@/lib/intelligence/v4/phase15P8StaffBackstage";
import { computePhase15P8UpgradePass } from "@/lib/intelligence/v4/phase15P8Closure";

export const dynamic = "force-dynamic";

export default function StaffBackstageHubPage() {
  const report = computePhase15P8UpgradePass();
  const surfaces = listStaffBackstageGuardSurfaces();
  const summary = buildStaffBackstageSummary();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P8"
        title="Staff backstage"
        description="Route-level STAFF profile guards on builder and operations surfaces — CANDIDATE and CLERK_WEEK redirect to command home, not nav-only hiding."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/supreme-workbench"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Supreme workbench (STAFF)
        </Link>
      </V4PageHeader>

      <Phase15P8UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-violet-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">
          {summary.guardCategoryCount} guarded categories · {summary.prefixCount} route prefixes
        </p>
        <p className="mt-2 text-kelly-muted">{summary.tonightReminder}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          Operations drawer on STAFF profile links here first. Candidate deploy never sees builder URLs in nav — and
          direct URLs redirect via StaffBackstageRouteGuard in the intelligence layout.
        </p>
      </section>

      <CandidateStaffBackstageGuardPanel surfaces={surfaces} />
    </div>
  );
}
