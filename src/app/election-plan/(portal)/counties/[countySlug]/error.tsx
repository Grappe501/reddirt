"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CountyOperatingCenterError({ error, reset }: Props) {
  useEffect(() => {
    console.error("County operating center error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="ep-chapter-body px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-2xl ep-card border-l-4 border-amber-500 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">County operating center</p>
        <h1 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">This county page could not load</h1>
        <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">
          Snapshot strategy data should still be available from the county index. Database-heavy sections (election history,
          media vault, field log) may be temporarily unavailable — try again in a moment.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-[var(--ep-navy-muted)]">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Retry
          </button>
          <Link
            href="/election-plan?tab=countyPlaybooks"
            className="rounded-lg border border-[var(--ep-border)] px-4 py-2 text-sm font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
          >
            ← County intelligence index
          </Link>
        </div>
      </div>
    </div>
  );
}
