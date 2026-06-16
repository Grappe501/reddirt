"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";

import { electionPlanSearchHref } from "@/lib/election-plan/load-election-plan-search";

export function ElectionPlanSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === "/election-plan/search" ? (searchParams.get("q") ?? "") : "";
  const [q, setQ] = useState(urlQuery);

  useEffect(() => {
    if (pathname === "/election-plan/search") {
      setQ(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

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
      <label htmlFor="ep-global-search" className="sr-only">
        Search Election Plan
      </label>
      <div className="flex overflow-hidden rounded-lg border border-[var(--ep-border)] bg-white shadow-sm">
        <input
          id="ep-global-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plan, counties, budget, Po5…"
          className="min-w-0 flex-1 px-3 py-2 text-sm text-[var(--ep-navy)] placeholder:text-[var(--ep-navy-muted)] focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="shrink-0 bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[var(--ep-navy)]/90"
        >
          Search
        </button>
      </div>
      {pathname !== "/election-plan/search" ? (
        <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
          Local index only · no admin or private data
        </p>
      ) : null}
    </form>
  );
}

export function ElectionPlanPortalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ep-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/election-plan" className="shrink-0 font-heading text-sm font-bold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
            Election Plan
          </Link>
          <span className="hidden text-[var(--ep-navy-muted)] sm:inline">·</span>
          <Link href="/election-plan/search" className="hidden text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)] sm:inline">
            Search
          </Link>
          <span className="hidden rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)] lg:inline">
            18.7H
          </span>
        </div>
        <div className="w-full min-w-[12rem] flex-1 sm:max-w-md">
          <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-lg bg-[var(--ep-cream)]" />}>
            <ElectionPlanSearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
