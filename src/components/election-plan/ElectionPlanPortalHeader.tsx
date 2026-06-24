"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";

import { ElectionPlanPortalNav } from "@/components/election-plan/ElectionPlanPortalNav";
import { electionPlanSearchHref } from "@/lib/election-plan/load-election-plan-search";
import type { PortalAuthMode } from "@/lib/election-plan/auth/portal-access";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export function ElectionPlanSearchBar({
  className,
  prominent = false,
}: {
  className?: string;
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
      <div className={`ep-search ${prominent ? "ep-search-prominent" : ""}`}>
        <input
          id={prominent ? "ep-page-search" : "ep-global-search"}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workbenches, counties, debate prep…"
          className={`ep-search-input ${prominent ? "ep-search-input-prominent" : ""}`}
          autoComplete="off"
          autoFocus={prominent && !urlQuery}
        />
        <button type="submit" className={`ep-search-submit ${prominent ? "ep-search-submit-prominent" : ""}`}>
          Search
        </button>
      </div>
      {!onSearchPage || prominent ? (
        <p className="mt-1.5 text-[10px] text-[var(--ep-navy-muted)]">
          Local index · election plan · executive book · debate prep
        </p>
      ) : null}
    </form>
  );
}

export function ElectionPlanPortalHeader({
  authMode = "election-plan",
  volunteerLeader = null,
}: {
  authMode?: PortalAuthMode;
  volunteerLeader?: VolunteerLeader | null;
}) {
  const volunteerOnly = authMode === "volunteer-leader";

  return (
    <header className="ep-portal-topbar">
      <div className="ep-portal-topbar-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            <Link href={volunteerOnly ? "/election-plan/operators/leaders/me" : "/election-plan"} className="ep-portal-brand">
              <span className="ep-portal-brand-mark" aria-hidden>
                KG
              </span>
              <span className="ep-portal-brand-text">
                <span className="ep-portal-brand-title">{volunteerOnly ? "Leader Hub" : "Election Plan"}</span>
                <span className="ep-portal-brand-sub">
                  {volunteerOnly && volunteerLeader
                    ? `${volunteerLeader.displayName} · ${volunteerLeader.initials}`
                    : "Kelly Grappe · Internal Strategy"}
                </span>
              </span>
            </Link>
            {volunteerOnly ? (
              <nav className="ep-portal-nav" aria-label="Leader sections">
                <Link href="/election-plan/operators/leaders/me" className="ep-portal-nav-link" data-active="true">
                  My workbench
                </Link>
                <Link href="/election-plan/operators/leaders" className="ep-portal-nav-link">
                  All leaders
                </Link>
                {volunteerLeader?.commandAccess ? (
                  <Link href="/election-plan/operators/leaders/command" className="ep-portal-nav-link">
                    Command
                  </Link>
                ) : null}
              </nav>
            ) : (
              <ElectionPlanPortalNav />
            )}
            {!volunteerOnly ? <span className="ep-portal-version-badge">v18.7</span> : null}
          </div>
          {!volunteerOnly ? (
            <div className="w-full min-w-[12rem] sm:max-w-md lg:w-auto lg:flex-1 lg:max-w-sm">
              <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-lg bg-[var(--ep-cream)]" />}>
                <ElectionPlanSearchBar />
              </Suspense>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
