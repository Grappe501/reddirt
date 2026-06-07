import Link from "next/link";
import { Phase4UpgradePassPanel } from "@/components/admin/intelligence/Phase4UpgradePassPanel";
import { StrategyMigrationTable } from "@/components/admin/intelligence/StrategyMigrationTable";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  computeCanonLoopStats,
  FIELD_BOOK_CANON_BINDINGS,
} from "@/lib/intelligence/fieldBookCanonRegistry";
import { getFieldBookArticle, FIELD_BOOK_HUB_HREF } from "@/lib/intelligence/fieldBookRegistry";
import { computePhase4UpgradePass } from "@/lib/intelligence/v4/phase4CanonLoop";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { FieldBookPromotionExecutionStrip } from "@/components/admin/intelligence/field-book/FieldBookPromotionExecutionStrip";

export const dynamic = "force-dynamic";

export default function FieldBookCanonHubPage() {
  const stats = computeCanonLoopStats();
  const phase4 = computePhase4UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Field Book · Phase 4 canon loop"
        title="Intelligence ↔ Field Book canon registry"
        description={`${stats.bindingCount} route bindings · ${stats.articleSlugs} linked articles · ${stats.routesWithClaimsGate} routes with claims ledger gates`}
      >
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_HUB_HREF}
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Field Book home
        </Link>
        <Link
          href="/admin/intelligence/field-book-promotion-execution"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Promotion execution (P8)
        </Link>
        <Link
          href="/admin/intelligence/phase-4-upgrade"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Phase 4 upgrade
        </Link>
      </V4PageHeader>

      <Phase4UpgradePassPanel report={phase4} compact />

      <FieldBookPromotionExecutionStrip />

      <article className="mb-8 rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5 text-sm">
        <p className="font-bold uppercase text-violet-950">How the canon loop works</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Every intelligence page shows a Field Book canon strip when bindings exist.</li>
          <li>Staff deepens page content → promotes summary into Field Book articles.</li>
          <li>Claims used on stage register through the claims ledger before public adaptation.</li>
          <li>Build progress and Phase A % track real data — not empty scaffolding.</li>
        </ol>
      </article>

      <div className="space-y-4">
        {FIELD_BOOK_CANON_BINDINGS.map((binding) => (
          <section
            key={binding.routePrefix}
            className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <IntelligenceNavLink
                  href={binding.routePrefix}
                  variant="chip"
                  className="font-mono text-sm font-bold text-kelly-navy underline"
                >
                  {binding.routePrefix}
                </IntelligenceNavLink>
                {binding.laneHint ? (
                  <span className="ml-2 rounded-full border border-kelly-text/15 px-2 py-0.5 text-[9px] font-bold uppercase">
                    {binding.laneHint} lane
                  </span>
                ) : null}
              </div>
              {binding.claimsLedgerHref ? (
                <IntelligenceNavLink href={binding.claimsLedgerHref} variant="chip" className="text-xs font-bold text-rose-900 underline">
                  Claims gate →
                </IntelligenceNavLink>
              ) : null}
            </div>
            <p className="mt-2 text-kelly-muted">{binding.promoteNote}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {binding.fieldBookSlugs.map((slug) => {
                const article = getFieldBookArticle(slug);
                return (
                  <li key={slug}>
                    <IntelligenceNavLink
                      href={`/admin/intelligence/field-book/${slug}`}
                      variant="chip"
                      className="rounded-full border border-violet-200 bg-violet-50/50 px-3 py-1 text-xs font-bold text-violet-950"
                    >
                      {article?.title ?? slug}
                    </IntelligenceNavLink>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8">
        <StrategyMigrationTable compact />
      </div>
    </div>
  );
}
