import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  listStrategyMigrationRoutes,
  resolveStrategyManualLabels,
} from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";

export function StrategyMigrationTable({ compact }: { compact?: boolean }) {
  const routes = listStrategyMigrationRoutes();

  return (
    <section className={`rounded-xl border border-violet-200 bg-violet-50/30 ${compact ? "p-4 text-xs" : "p-6 text-sm"}`}>
      <h2 className="font-bold uppercase text-violet-950">Strategy migration bridge</h2>
      <p className="mt-2 text-kelly-muted">
        Intelligence routes mapped to Kelly SOS strategic plan chapters and Field Book promotion targets.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-violet-200 text-[10px] uppercase text-violet-900">
              <th className="py-2 pr-3">Intelligence route</th>
              <th className="py-2 pr-3">Manual chapters</th>
              <th className="py-2">Field Book targets</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.intelligenceHref} className="border-b border-violet-100 align-top">
                <td className="py-3 pr-3">
                  <IntelligenceNavLink href={route.intelligenceHref} variant="chip" className="font-bold text-kelly-navy underline">
                    {route.label}
                  </IntelligenceNavLink>
                  {!compact ? <p className="mt-1 text-kelly-subtle">{route.promoteNote}</p> : null}
                </td>
                <td className="py-3 pr-3 text-kelly-muted">
                  {resolveStrategyManualLabels(route.strategyPathKeys).join(" · ")}
                </td>
                <td className="py-3">
                  <ul className="flex flex-wrap gap-1">
                    {route.fieldBookSlugs.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/admin/intelligence/field-book/${slug}`}
                          className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-bold text-violet-950"
                        >
                          {getFieldBookArticle(slug)?.title ?? slug}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
