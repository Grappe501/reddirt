import Link from "next/link";
import { Phase4UpgradePassPanel } from "@/components/admin/intelligence/Phase4UpgradePassPanel";
import { StrategyMigrationTable } from "@/components/admin/intelligence/StrategyMigrationTable";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase4UpgradePass } from "@/lib/intelligence/v4/phase4CanonLoop";
import { FIELD_BOOK_CANON_BINDINGS } from "@/lib/intelligence/fieldBookCanonRegistry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase4UpgradePage() {
  const report = computePhase4UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 4"
        title="Field Book canon loop + strategy migration"
        description="Route bindings connect every intelligence surface to encyclopedia articles and claims gates; strategy manual chapters bridge the promotion workflow."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Canon registry
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Strategy alignment
        </Link>
      </V4PageHeader>

      <Phase4UpgradePassPanel report={report} />

      <article className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">The canon loop</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Staff deepens an intelligence page (diligence log, dossier section, trap lane script).</li>
          <li>Gold canon strip shows bound Field Book articles — promote summary prose into encyclopedia entries.</li>
          <li>Claims used on stage register in the ledger before any public adaptation or Field Book body update.</li>
          <li>Strategy manual chapters preview via strategy-alignment — migrate only when intelligence phase gate is green.</li>
        </ol>
      </article>

      <StrategyMigrationTable />

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Route bindings ({FIELD_BOOK_CANON_BINDINGS.length})</h2>
        <p className="mt-2 text-xs text-kelly-muted">
          Full registry also at{" "}
          <Link href="/admin/intelligence/field-book/canon" className="font-bold text-kelly-navy underline">
            /admin/intelligence/field-book/canon
          </Link>
        </p>
      </section>
    </div>
  );
}
