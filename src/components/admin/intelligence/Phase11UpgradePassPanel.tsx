import Link from "next/link";
import type { Phase11UpgradePassReport } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import type { CampaignSystemCategoryGuide } from "@/lib/intelligence/v4/campaignSystemManualInventory";
import { campaignSystemDocHref } from "@/lib/campaign-strategy/campaign-system-nav-shared";

export function Phase11UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Upgrade pass 11 · P0</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-violet-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">{p.totalFiles} files surfaced</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Files</dt>
          <dd className="font-bold text-kelly-navy">{p.totalFiles}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Categories</dt>
          <dd className="font-bold text-kelly-navy">{p.categoriesWithFiles}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Priority tomes</dt>
          <dd className="font-bold text-kelly-navy">{p.priorityPathsInInventory}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Migration routes</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyMigrationRoutes}</dd>
        </div>
      </dl>
    </section>
  );
}

export function CampaignSystemCategoryGuidePanel({ guides }: { guides: CampaignSystemCategoryGuide[] }) {
  return (
    <section className="mb-8 space-y-5">
      {guides.map((guide) => (
        <article
          key={guide.categoryId}
          id={guide.categoryId}
          className="rounded-xl border border-violet-200/60 bg-white p-5"
        >
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{guide.label}</h2>
          <p className="mt-1 text-sm text-kelly-muted">{guide.summary}</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Operator use</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-muted">
                {guide.operatorUse.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Intelligence links</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {guide.intelligenceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {guide.priorityPathKeys.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Priority documents</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {guide.priorityPathKeys.map((pk) => (
                  <Link
                    key={pk}
                    href={campaignSystemDocHref(pk)}
                    className="rounded-full border border-kelly-navy/15 bg-kelly-navy/5 px-2.5 py-0.5 text-[11px] font-semibold text-kelly-navy hover:bg-kelly-navy/10"
                  >
                    {pk.split("/").pop() ?? pk}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
