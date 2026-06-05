"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  FIELD_BOOK_CANON_HUB_HREF,
  resolveCanonArticles,
  resolveCanonBinding,
} from "@/lib/intelligence/fieldBookCanonRegistry";
import { THREE_LANE_NAV, type ThreeLaneId } from "@/lib/intelligence/v4/threeLaneNav";

export function FieldBookCanonPanel({ compact }: { compact?: boolean }) {
  const pathname = usePathname() ?? "";
  const binding = resolveCanonBinding(pathname);
  const articles = resolveCanonArticles(pathname);

  if (!binding || !articles.length) return null;

  const lane = binding.laneHint ? THREE_LANE_NAV[binding.laneHint as ThreeLaneId] : null;

  return (
    <aside
      className={`rounded-xl border-2 border-kelly-gold/40 bg-gradient-to-br from-amber-50/60 to-white ${compact ? "mb-4 p-4 text-xs" : "mb-6 p-5 text-sm"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-950">Field Book canon</p>
          <p className="mt-1 font-semibold text-kelly-navy">Connected encyclopedia entries for this page</p>
        </div>
        {lane ? (
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${lane.chipClass}`}>
            {lane.shortLabel} lane
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-kelly-muted">{binding.promoteNote}</p>

      <ul className="mt-3 space-y-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <IntelligenceNavLink
              href={`/admin/intelligence/field-book/${article.slug}`}
              variant="chip"
              className="inline-flex rounded-lg border border-kelly-navy/15 bg-white px-3 py-2 font-semibold text-kelly-navy hover:border-kelly-navy/35"
            >
              {article.title}
            </IntelligenceNavLink>
            {!compact ? <p className="mt-1 text-xs text-kelly-subtle">{article.summary}</p> : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <IntelligenceNavLink
          href={FIELD_BOOK_CANON_HUB_HREF}
          variant="chip"
          className="text-kelly-navy underline"
        >
          Canon loop hub →
        </IntelligenceNavLink>
        {binding.claimsLedgerHref ? (
          <IntelligenceNavLink href={binding.claimsLedgerHref} variant="chip" className="text-rose-900 underline">
            Verify claims →
          </IntelligenceNavLink>
        ) : null}
        <Link href="/admin/intelligence/field-book/phase/phase-d" className="text-violet-950 underline">
          Phase D organization →
        </Link>
      </div>
    </aside>
  );
}
