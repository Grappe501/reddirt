import Link from "next/link";
import { cn } from "@/lib/utils";
import { countyVolunteerPath, formatCountySlugLabel } from "@/lib/content/county-display";

export type ContentLocalityProps = {
  countySlug?: string | null;
  city?: string | null;
  /** When true, county chip links to volunteer pathway with `?county=` hint for future form prefill. */
  linkCounty?: boolean;
  className?: string;
  variant?: "compact" | "journal";
};

/**
 * Consistent locality for content cards. Sets `data-county-slug` when present for future county routes.
 */
export function ContentLocality({
  countySlug,
  city,
  linkCounty = true,
  className,
  variant = "compact",
}: ContentLocalityProps) {
  const c = countySlug?.trim() || null;
  const ct = city?.trim() || null;
  if (!c && !ct) return null;

  const countyLabel = c ? formatCountySlugLabel(c) : null;
  const isJournal = variant === "journal";
  const needsCountySuffix = Boolean(countyLabel && !/\bcounty\b/i.test(countyLabel));

  const chipClass = cn(
    "inline-flex max-w-full items-center rounded-full border font-semibold transition",
    isJournal
      ? "border-kelly-ink/20 bg-white px-3 py-1.5 text-xs uppercase tracking-wider text-kelly-ink shadow-sm"
      : "border-kelly-navy/25 bg-kelly-navy/5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-kelly-navy",
    linkCounty && c && "hover:border-kelly-gold/45 hover:bg-white",
  );

  const countyInner = countyLabel ? (
    <>
      <span className="sr-only">County: </span>
      {countyLabel}
      {needsCountySuffix ? (
        <span
          className={cn(
            "font-body font-normal normal-case tracking-normal text-kelly-slate/75",
            isJournal ? "ml-1 text-[11px]" : "ml-1 text-[10px]",
          )}
        >
          County
        </span>
      ) : null}
    </>
  ) : null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", isJournal ? "mt-3" : "mt-1", className)}
      data-county-slug={c ?? undefined}
      data-city={ct ?? undefined}
    >
      {countyLabel && c ? (
        linkCounty ? (
          <Link href={countyVolunteerPath(c)} className={chipClass} aria-label={`Volunteer or connect in ${countyLabel} County`}>
            {countyInner}
          </Link>
        ) : (
          <span className={chipClass}>{countyInner}</span>
        )
      ) : null}
      {ct ? (
        <span className={cn("font-body text-kelly-slate", isJournal ? "text-sm font-medium text-kelly-ink/90" : "text-xs")}>
          {c ? <span className="mr-1.5 text-kelly-slate/35" aria-hidden>·</span> : null}
          <span className="sr-only">City: </span>
          {ct}
        </span>
      ) : null}
    </div>
  );
}
