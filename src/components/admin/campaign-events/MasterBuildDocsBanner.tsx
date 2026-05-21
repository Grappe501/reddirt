import Link from "next/link";
import {
  CAMPAIGN_OS_CURRENT_SPRINT,
  CAMPAIGN_OS_MASTER_BUILD_DOCS,
  masterBuildDocPath,
} from "@/lib/campaign-events/master-build-docs";

/** Sprint 0 control docs — repo paths for operators and AI threads. */
export function MasterBuildDocsBanner() {
  return (
    <section
      className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/10 p-4 font-body text-sm text-kelly-text"
      aria-labelledby="master-build-docs-heading"
    >
      <h2 id="master-build-docs-heading" className="font-heading text-base font-bold text-kelly-navy">
        Master build control (Sprint 0)
      </h2>
      <p className="mt-1 text-kelly-text/75">
        Shared source of truth for the 10-sprint Campaign OS. Docs live in the repo (open in your editor):
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-xs sm:text-sm">
        {CAMPAIGN_OS_MASTER_BUILD_DOCS.map((d) => (
          <li key={d.id}>
            <span className="font-semibold">{d.label}</span>
            <code className="ml-1 rounded bg-white/60 px-1.5 py-0.5 font-mono text-[11px]">{masterBuildDocPath(d.file)}</code>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-bold text-kelly-navy">
        Active sprint: {CAMPAIGN_OS_CURRENT_SPRINT.number} — {CAMPAIGN_OS_CURRENT_SPRINT.name}
      </p>
      <p className="mt-2 flex flex-wrap gap-3 text-xs">
        <Link href="/admin/campaign-events/workbench" className="font-bold text-kelly-navy underline">
          Event workbench
        </Link>
        <Link href="/admin/campaign-events/reimbursement?month=2026-05" className="font-bold text-kelly-navy underline">
          Reimbursement (May MTD)
        </Link>
        <Link href="/admin/campaign-events/month-readiness?month=2026-05" className="font-bold text-kelly-navy underline">
          Month readiness
        </Link>
      </p>
    </section>
  );
}
