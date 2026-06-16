"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import { readinessBandLabel } from "@/lib/election-plan/community-workbench/ownership-warnings";
import type { CommunityFieldQACheck } from "@/lib/election-plan/community-workbench/field-qa";
import type { PilotValidationSnapshot } from "@/lib/election-plan/community-workbench/load-pilot-status";
import type { CommunityWorkbenchHubSummary } from "@/lib/election-plan/community-workbench/types";
import { cn } from "@/lib/utils";

import { CommunityWorkbenchPilotStatusPanel } from "./CommunityWorkbenchPilotStatusPanel";

type Props = {
  workbenches: CommunityWorkbenchHubSummary[];
  totalCount: number;
  initialQuery?: string;
  qaChecks: CommunityFieldQACheck[];
  pilotSnapshot: PilotValidationSnapshot;
  operatorInitials: string | null;
};

type KindFilter = "all" | "city" | "campus" | "program";
type OwnerFilter = "all" | "has" | "missing";
type EventsFilter = "all" | "upcoming" | "none";
type ReadinessFilter = "all" | "green" | "yellow" | "red";

function kindBadge(kind: string): string {
  if (kind === "program") return "bg-violet-100 text-violet-900";
  if (kind === "campus") return "bg-indigo-100 text-indigo-900";
  return "bg-teal-100 text-teal-900";
}

function readinessBadge(band: "green" | "yellow" | "red"): string {
  if (band === "green") return "bg-emerald-100 text-emerald-900";
  if (band === "yellow") return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}

export function CommunityWorkbenchHubPanel({
  workbenches,
  totalCount,
  initialQuery = "",
  qaChecks,
  pilotSnapshot,
  operatorInitials,
}: Props) {
  const [q, setQ] = useState(initialQuery);
  const [kind, setKind] = useState<KindFilter>("all");
  const [owner, setOwner] = useState<OwnerFilter>("all");
  const [events, setEvents] = useState<EventsFilter>("all");
  const [readiness, setReadiness] = useState<ReadinessFilter>("all");
  const [showQa, setShowQa] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return workbenches.filter((wb) => {
      if (kind !== "all" && wb.kind !== kind) return false;
      if (owner === "has" && !wb.hasOwner) return false;
      if (owner === "missing" && wb.hasOwner) return false;
      if (events === "upcoming" && !wb.hasUpcomingEvent) return false;
      if (events === "none" && wb.hasUpcomingEvent) return false;
      if (readiness !== "all" && wb.readinessBand !== readiness) return false;
      if (term) {
        const blob = [wb.name, wb.tagline ?? "", wb.kind, wb.countySlug ?? "", wb.communityLead ?? ""]
          .join(" ")
          .toLowerCase();
        if (!blob.includes(term) && !wb.slug.includes(term.replace(/\s+/g, "-"))) return false;
      }
      return true;
    });
  }, [q, kind, owner, events, readiness, workbenches]);

  const missingOwnerCount = workbenches.filter((w) => !w.hasOwner).length;
  const qaPassCount = qaChecks.filter((c) => c.pass).length;
  const qaAllPass = qaPassCount === qaChecks.length;

  const featured = ["sherwood", "jacksonville", "quitman", "bentonville", "jonesboro", "uca-campus", "election-integrity", "direct-democracy"];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Community Workbench Framework v1.3</p>
      <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)] lg:text-3xl">Local Action Hubs</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
        One operating template. Unlimited communities. Jacksonville, Sherwood, Quitman, campuses, and movement programs
        all run leadership, missions, KPIs, committees, events, relationships, and field logging here — not on county
        intelligence pages.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowTraining((v) => !v)}
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          {showTraining ? "Hide" : "10-min"} field training
        </button>
        <button
          type="button"
          onClick={() => setShowQa((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-semibold",
            qaAllPass
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-amber-300 bg-amber-50 text-amber-900",
          )}
        >
          Field QA · {qaPassCount}/{qaChecks.length}
        </button>
        <Link
          href="/election-plan/workbenches#pilot-validation"
          className="rounded-lg border border-[var(--ep-navy)] bg-[var(--ep-navy)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          Live pilot status
        </Link>
        <Link
          href="/election-plan/workbenches#deploy-gate"
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          Production deploy gate
        </Link>
      </div>

      {showTraining ? (
        <div className="mt-4 rounded-lg border border-[var(--ep-gold)] bg-[var(--ep-cream)] p-4 text-sm leading-relaxed text-[var(--ep-navy)]">
          <p className="font-heading font-bold">How to run a local team meeting (10 minutes)</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Sign in with your 3-letter operator initials (top bar).</li>
            <li>Open your community workbench — assign a Community Lead if empty.</li>
            <li>Review readiness bottlenecks; add one mission for this week.</li>
            <li>Create or open the next event; add run-of-show rows and volunteer roles.</li>
            <li>Assign an event lead and link a committee if one owns the event.</li>
            <li>Log field activity in the field log (conversations, volunteers, leaders).</li>
            <li>After the event: set status to Executed, record attendance, write the AAR.</li>
            <li>Mark After-action complete — confirm readiness score moved.</li>
          </ol>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Full script: <code className="text-[10px]">docs/COMMUNITY_WORKBENCH_FIELD_TRAINING.md</code>
          </p>
        </div>
      ) : null}

      {showQa ? (
        <ul className="mt-4 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)] text-sm">
          {qaChecks.map((check) => (
            <li key={check.id} className="flex items-start gap-3 px-4 py-2">
              <span className={cn("mt-0.5 font-bold", check.pass ? "text-emerald-700" : "text-red-700")}>
                {check.pass ? "✓" : "✗"}
              </span>
              <div>
                <p className="font-medium text-[var(--ep-navy)]">{check.label}</p>
                {check.detail ? <p className="text-xs text-[var(--ep-navy-muted)]">{check.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {missingOwnerCount > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">{missingOwnerCount} workbench{missingOwnerCount === 1 ? "" : "es"} missing a Community Lead</p>
          <p className="mt-1 text-xs">Filter by &ldquo;No owner&rdquo; below to find and assign leads before field rollout.</p>
        </div>
      ) : null}

      <CommunityWorkbenchPilotStatusPanel snapshot={pilotSnapshot} operatorInitials={operatorInitials} />

      <div className="mt-6">
        <label htmlFor="wb-search" className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Search Community Workbenches
        </label>
        <input
          id="wb-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Leader name, event title, committee, notebook…"
          className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ep-gold)]"
          autoFocus={Boolean(initialQuery)}
        />
        <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
          {totalCount} workbenches · deep search from Election Plan search (leaders, events, run-of-show, notebook)
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect label="Kind" value={kind} onChange={(v) => setKind(v as KindFilter)}>
          <option value="all">All kinds</option>
          <option value="city">City</option>
          <option value="campus">Campus</option>
          <option value="program">Program</option>
        </FilterSelect>
        <FilterSelect label="Owner" value={owner} onChange={(v) => setOwner(v as OwnerFilter)}>
          <option value="all">All</option>
          <option value="has">Has Community Lead</option>
          <option value="missing">No owner</option>
        </FilterSelect>
        <FilterSelect label="Events" value={events} onChange={(v) => setEvents(v as EventsFilter)}>
          <option value="all">All</option>
          <option value="upcoming">Upcoming event</option>
          <option value="none">No upcoming event</option>
        </FilterSelect>
        <FilterSelect label="Readiness" value={readiness} onChange={(v) => setReadiness(v as ReadinessFilter)}>
          <option value="all">All</option>
          <option value="green">Green (67%+)</option>
          <option value="yellow">Yellow (34–66%)</option>
          <option value="red">Red (&lt;34%)</option>
        </FilterSelect>
      </div>

      {!q.trim() && kind === "all" && owner === "all" && events === "all" && readiness === "all" ? (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Featured</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {featured.map((slug) => {
              const wb = workbenches.find((w) => w.slug === slug);
              if (!wb) return null;
              return (
                <Link
                  key={slug}
                  href={communityWorkbenchHref(slug)}
                  className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
                >
                  {wb.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
        Showing {filtered.length} of {workbenches.length} loaded summaries
      </p>

      <ul className="mt-2 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
        {filtered.map((wb) => (
          <li key={wb.slug}>
            <Link
              href={communityWorkbenchHref(wb.slug)}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--ep-cream)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-[var(--ep-navy)]">{wb.name}</p>
                {wb.tagline ? <p className="text-xs text-[var(--ep-navy-muted)]">{wb.tagline}</p> : null}
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[var(--ep-navy-muted)]">
                  {wb.communityLead ? (
                    <span>Lead: {wb.communityLead}</span>
                  ) : (
                    <span className="font-semibold text-amber-800">No Community Lead</span>
                  )}
                  {wb.hasUpcomingEvent ? <span>· Upcoming event</span> : null}
                  {wb.warningCount > 0 ? <span className="text-amber-800">· {wb.warningCount} warning{wb.warningCount === 1 ? "" : "s"}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${readinessBadge(wb.readinessBand)}`}>
                  {wb.readinessPct}% · {readinessBandLabel(wb.readinessBand)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${kindBadge(wb.kind)}`}>
                  {wb.kind}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm italic text-[var(--ep-navy-muted)]">No workbenches match these filters.</li>
        ) : null}
      </ul>

      <section id="deploy-gate" className="mt-10 scroll-mt-24 rounded-lg border border-[var(--ep-border)] bg-white p-4 text-sm">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Production deploy gate (summary)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--ep-navy-muted)]">
          <li>Scope Netlify env vars: Builds-only for <code>NEXT_PUBLIC_*</code>, <code>NODE_OPTIONS</code>, <code>PRISMA_*</code>, <code>SKIP_DB_SEED</code>.</li>
          <li>Keep on Functions: <code>DATABASE_URL</code>, <code>ADMIN_SECRET</code>, <code>ELECTION_PLAN_PASSWORD</code>.</li>
          <li>Confirm build runs <code>prisma migrate deploy</code> — check deploy log for migration success.</li>
          <li>Smoke: sign in → open workbench → create test event → verify readiness updates → delete test event.</li>
        </ol>
        <p className="mt-3 text-xs">
          Full checklist: <code>docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md</code>,{" "}
          <code>docs/COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md</code>, and <code>docs/NETLIFY_FIRST_DEPLOY.md</code> §6
        </p>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
      >
        {children}
      </select>
    </label>
  );
}
