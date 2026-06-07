import Link from "next/link";
import { CandidateIpadPolishPanel } from "@/components/admin/intelligence/CandidateIpadPolishPanel";
import { Phase15P7UpgradePassPanel } from "@/components/admin/intelligence/Phase15P7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { CANDIDATE_IPAD_DEPLOY_HINT, CANDIDATE_IPAD_PROFILE, isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";
import {
  buildIpadPolishSummary,
  listIpadBottomNavTabs,
  listIpadCceSections,
} from "@/lib/intelligence/v4/phase15P7IpadPolish";
import { computePhase15P7UpgradePass } from "@/lib/intelligence/v4/phase15P7Closure";

export const dynamic = "force-dynamic";

export default function IpadPolishHubPage() {
  const report = computePhase15P7UpgradePass();
  const tabs = listIpadBottomNavTabs("CANDIDATE");
  const sections = listIpadCceSections("CANDIDATE");
  const summary = buildIpadPolishSummary(isCandidateIpadMode());

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P7"
        title="iPad polish"
        description="Candidate iPad bottom nav aligned to five CCE sections — Home, Rehearse, Philosophy, Opposition, Safety — with touch-safe section sheets and 820px column."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/demo-mode"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Demo script
        </Link>
      </V4PageHeader>

      <Phase15P7UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-sky-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">
          {CANDIDATE_IPAD_PROFILE.label} · {summary.bottomNavTabs} bottom tabs · max{" "}
          {CANDIDATE_IPAD_PROFILE.maxContentWidthPx}px
        </p>
        <p className="mt-2 text-kelly-muted">{summary.tonightReminder}</p>
        <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50/40 p-3 text-[10px] text-sky-950">
          {CANDIDATE_IPAD_DEPLOY_HINT}
        </p>
      </section>

      <CandidateIpadPolishPanel tabs={tabs} sections={sections} />
    </div>
  );
}
