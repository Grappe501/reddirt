"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CountyDashboardShell } from "@/components/county/dashboard";
import { cn, focusRing } from "@/lib/utils";

export default function FaulknerCountyDashboardV2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[county-briefings/faulkner/v2]", error);
  }, [error]);

  return (
    <CountyDashboardShell className="py-10">
      <h1 className="font-heading text-2xl font-bold text-kelly-navy">County dashboard unavailable</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-kelly-text/80">
        The Faulkner briefing shell could not load. This is usually a temporary data or configuration issue—not missing voter rows on-page.
      </p>
      <p className="mt-2 font-mono text-xs text-kelly-text/50">{error.digest ? `Reference: ${error.digest}` : null}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(
            focusRing,
            "rounded-btn bg-kelly-navy px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wide text-white",
          )}
        >
          Try again
        </button>
        <Link
          href="/county-briefings"
          className={cn(
            focusRing,
            "inline-flex items-center rounded-btn border border-kelly-text/20 px-5 py-2.5 font-body text-sm font-semibold text-kelly-navy",
          )}
        >
          County briefings hub
        </Link>
      </div>
    </CountyDashboardShell>
  );
}
