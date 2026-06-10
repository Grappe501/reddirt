import Link from "next/link";
import type { PublicCountyPresenceRow } from "@/lib/county/public-county-presence";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";
import { cn } from "@/lib/utils";

type Props = {
  counties: PublicCountyPresenceRow[];
  visitedCount: number;
  totalCounties: number;
};

export function ArkansasCountyGrid({ counties, visitedCount, totalCounties }: Props) {
  const copy = arkansasPresenceCopy;

  return (
    <section aria-labelledby="arkansas-county-grid">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="arkansas-county-grid" className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
            {copy.whereBeen.title}
          </h2>
          <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">{copy.whereBeen.lead}</p>
        </div>
        <p className="font-body text-sm font-semibold text-kelly-navy">
          {visitedCount} of {totalCounties} counties with verified visits
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 font-body text-xs text-kelly-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-kelly-navy" aria-hidden />
          {copy.mapLegend.verified}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-kelly-text/15" aria-hidden />
          {copy.mapLegend.notYet}
        </span>
      </div>

      {visitedCount === 0 ? (
        <p className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-6 font-body text-sm text-kelly-text/80">
          {copy.whereBeen.empty}
        </p>
      ) : (
        <ul
          className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          role="list"
          aria-label="Arkansas counties by verified visit status"
        >
          {counties.map((c) => (
            <li key={c.slug}>
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-center font-body text-xs font-semibold leading-tight",
                  c.visitVerified
                    ? "border-kelly-navy/30 bg-kelly-navy/10 text-kelly-navy"
                    : "border-kelly-text/10 bg-kelly-text/[0.04] text-kelly-text/55",
                )}
                title={
                  c.visitVerified && c.lastVerifiedVisitLabel
                    ? `Last verified visit: ${c.lastVerifiedVisitLabel}`
                    : "No verified visit published yet"
                }
              >
                {c.displayName}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center">
        <Link
          href="/arkansas/counties"
          className="font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
        >
          Search all 75 counties →
        </Link>
      </p>
    </section>
  );
}
