"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";

import { electionPlanSearchHref } from "@/lib/election-plan/load-election-plan-search";
import { ElectionPlanPortalNav } from "@/components/election-plan/ElectionPlanPortalNav";

export function ElectionPlanSearchBar({
  className,
  prominent = false,
}: {
  className?: string;
  /** Larger input on the dedicated search page. */
  prominent?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onSearchPage = pathname === "/election-plan/search";
  const urlQuery = onSearchPage ? (searchParams.get("q") ?? "") : "";
  const [q, setQ] = useState(urlQuery);

  useEffect(() => {
    if (onSearchPage) {
      setQ(searchParams.get("q") ?? "");
    }
  }, [onSearchPage, searchParams]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = q.trim();
      if (!trimmed) {
        router.push("/election-plan/search");
        return;
      }
      router.push(electionPlanSearchHref(trimmed));
    },
    [q, router],
  );

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <label htmlFor={prominent ? "ep-page-search" : "ep-global-search"} className="sr-only">
        Search Election Plan
      </label>
      {prominent ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Search</p>
      ) : null}
      <div
        className={`flex overflow-hidden rounded-lg border border-[var(--ep-border)] bg-white shadow-sm ${
          prominent ? "ring-1 ring-[var(--ep-gold)]/30" : ""
        }`}
      >
        <input
          id={prominent ? "ep-page-search" : "ep-global-search"}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workbenches, counties, budget, debate prep, Po5…"
          className={`min-w-0 flex-1 text-[var(--ep-navy)] placeholder:text-[var(--ep-navy-muted)] focus:outline-none ${
            prominent ? "px-4 py-3.5 text-base" : "px-3 py-2 text-sm"
          }`}
          autoComplete="off"
          autoFocus={prominent && !urlQuery}
        />
        <button
          type="submit"
          className={`shrink-0 bg-[var(--ep-navy)] font-bold uppercase tracking-wide text-white hover:bg-[var(--ep-navy)]/90 ${
            prominent ? "px-6 py-3.5 text-sm" : "px-4 py-2 text-xs"
          }`}
        >
          Search
        </button>
      </div>
      {!onSearchPage || prominent ? (
        <p className="mt-1.5 text-[10px] text-[var(--ep-navy-muted)]">
          Local index only · election plan · executive book · debate prep · no admin or private data
        </p>
      ) : null}
    </form>
  );
}

export function ElectionPlanPortalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ep-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <ElectionPlanPortalNav />
            <span className="hidden rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)] lg:inline">
              18.7H
            </span>
          </div>
          <div className="w-full min-w-[12rem] sm:max-w-md lg:w-auto lg:flex-1">
            <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-lg bg-[var(--ep-cream)]" />}>
              <ElectionPlanSearchBar />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
