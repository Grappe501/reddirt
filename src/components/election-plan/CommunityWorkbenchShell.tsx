"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { CommunityFundraisingGoalPanel } from "@/components/election-plan/CommunityFundraisingGoalPanel";
import { CommunityFundraisingOpportunitiesPanel } from "@/components/election-plan/CommunityFundraisingOpportunitiesPanel";
import { ElectionPlanFieldEntryPanel } from "@/components/election-plan/ElectionPlanFieldEntryPanel";
import { CommunityWorkbenchEventOpsPanel } from "@/components/election-plan/CommunityWorkbenchEventOpsPanel";
import { CommunityWorkbenchOwnershipWarnings } from "@/components/election-plan/CommunityWorkbenchOwnershipWarnings";
import { CommunityWorkbenchPilotSmokePanel } from "@/components/election-plan/CommunityWorkbenchPilotSmokePanel";
import { CommunityWorkbenchDefectLogPanel } from "@/components/election-plan/CommunityWorkbenchDefectLogPanel";
import { CommunityWorkbenchVoteCushionPanel } from "@/components/election-plan/CommunityWorkbenchVoteCushionPanel";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { collectOwnershipWarnings } from "@/lib/election-plan/community-workbench/ownership-warnings";
import type { CommunityPilotDefectRow } from "@/lib/election-plan/community-workbench/load-pilot-status";
import type { PilotSmokePath } from "@/lib/election-plan/community-workbench/pilot-smoke-paths";
import type { PilotWorkbenchValidation } from "@/lib/election-plan/community-workbench/pilot-validation";
import type { CommunityWorkbenchView } from "@/lib/election-plan/community-workbench/types";
import { COMMUNITY_INTEL_SECTIONS, COMMUNITY_NOTE_TYPES } from "@/lib/election-plan/community-workbench/constants";
import { communityWorkbenchHubHref } from "@/lib/election-plan/community-workbench/links";
import { communityWorkbenchEventHref, grassrootsGuitarStringsEventHref } from "@/lib/election-plan/community-workbench/event-links";
import { matchEventSlug, GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG } from "@/lib/election-plan/community-workbench/pilot-event-seeds";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { formatCushionPercent } from "@/lib/election-plan/community-workbench/vote-cushion";
import type { FosCommunityAllocation } from "@/lib/election-plan/fundraising-operating-system-shared";
import { cn } from "@/lib/utils";

type Props = {
  workbench: CommunityWorkbenchView;
  operatorInitials: string | null;
  pilotSmokePath?: PilotSmokePath | null;
  pilotValidation?: PilotWorkbenchValidation | null;
  pilotDefects?: CommunityPilotDefectRow[];
  fosAllocation?: FosCommunityAllocation | null;
  showOptionalPilotBanner?: boolean;
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <h2 className="mb-4 font-heading text-xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {children}
    </section>
  );
}

function ReadinessBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</span>
        <span className="tabular-nums font-semibold">{value}%</span>
      </div>
      <div className="ep-progress mt-1">
        <div className="ep-progress-bar" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function kindLabel(kind: string): string {
  if (kind === "city") return "City";
  if (kind === "campus") return "Campus";
  if (kind === "program") return "Program";
  if (kind === "coalition") return "Coalition";
  return "Community";
}

export function CommunityWorkbenchShell({
  workbench,
  operatorInitials,
  pilotSmokePath = null,
  pilotValidation = null,
  pilotDefects = [],
  fosAllocation = null,
  showOptionalPilotBanner = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownershipWarnings = useMemo(
    () =>
      collectOwnershipWarnings({
        workbenchName: workbench.name,
        leadership: workbench.leadership,
        events: workbench.events,
        committees: workbench.committees,
      }),
    [workbench],
  );

  const post = useCallback(
    async (section: string, payload: Record<string, unknown>) => {
      if (!operatorInitials) {
        setError("Sign in with your 3-letter initials to edit this workbench.");
        return false;
      }
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/election-plan/workbenches/${workbench.slug}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, payload }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return false;
        }
        router.refresh();
        return true;
      } catch {
        setError("Network error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [operatorInitials, router, workbench.slug],
  );

  const coalitionProfile = workbench.coalitionProfile;
  const intelSectionOptions = coalitionProfile
    ? coalitionProfile.intelSections.map((s) => ({ key: s.key, label: s.label }))
    : [...COMMUNITY_INTEL_SECTIONS];

  const nav = [
    { id: "overview", label: "Overview" },
    ...(workbench.voteCushion ? [{ id: "vote-cushion", label: "Vote cushion" }] : []),
    ...(fosAllocation ? [{ id: "fundraising", label: "Fundraising" }] : []),
    { id: "readiness", label: "Readiness" },
    { id: "leadership", label: "Leadership" },
    { id: "missions", label: "Missions" },
    { id: "kpis", label: "KPIs" },
    { id: "field-log", label: "Field log" },
    { id: "committees", label: "Committees" },
    { id: "events", label: "Events" },
    ...(coalitionProfile ? [{ id: "coalition-framework", label: "Coalition framework" }] : []),
    { id: "intel", label: "Local intel" },
    { id: "relationships", label: "Relationships" },
    { id: "notebook", label: "Notebook" },
  ];

  return (
    <div>
      <Link href={communityWorkbenchHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Community Workbenches
      </Link>
      {workbench.kind === "coalition" ? (
        <Link
          href="/election-plan?tab=coalitionCommand"
          className="ml-3 text-xs font-semibold text-[var(--ep-gold)] hover:underline"
        >
          Coalition Command hub
        </Link>
      ) : null}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
            Community Workbench · {kindLabel(workbench.kind)}
          </p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)] lg:text-3xl">
            {workbench.name}
          </h1>
          {workbench.tagline ? (
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{workbench.tagline}</p>
          ) : null}
          {workbench.countyName ? (
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
              {workbench.countyName} County
              {workbench.countySlug ? (
                <>
                  {" · "}
                  <Link href={countyPlaybookHref(workbench.countyName, workbench.countySlug)} className="underline">
                    County intelligence
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border-2 border-[var(--ep-gold)] bg-[var(--ep-cream)] px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Overall readiness</p>
          <p className="font-heading text-3xl font-bold tabular-nums text-[var(--ep-navy)]">
            {workbench.readiness.overallPct}%
          </p>
          <p className="text-[10px] text-[var(--ep-navy-muted)]">Bottleneck radar — not a grade</p>
        </div>
      </div>

      <nav className="sticky top-14 z-30 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[var(--ep-border)] bg-white/95 py-2 backdrop-blur">
        {nav.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy-muted)] hover:bg-[var(--ep-cream)] hover:text-[var(--ep-navy)]"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      {showOptionalPilotBanner ? (
        <div className="mb-6 rounded-lg border border-[var(--ep-border)] bg-white px-4 py-3 text-sm">
          <p className="font-semibold text-[var(--ep-navy)]">Optional city pilot — not the primary smoke gate</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Primary pilots:{" "}
            <Link href="/election-plan/workbenches/jacksonville#pilot-smoke" className="font-semibold text-[var(--ep-gold)] hover:underline">
              Jacksonville city
            </Link>
            {" · "}
            <Link href={grassrootsGuitarStringsEventHref()} className="font-semibold text-[var(--ep-gold)] hover:underline">
              Grassroots &amp; Guitar Strings event
            </Link>
            . G&amp;G event leadership lives on the event workbench — not city leadership.
          </p>
        </div>
      ) : null}

      <CommunityWorkbenchOwnershipWarnings warnings={ownershipWarnings} slug={workbench.slug} />

      {pilotSmokePath && pilotValidation ? (
        <CommunityWorkbenchPilotSmokePanel smokePath={pilotSmokePath} validation={pilotValidation} />
      ) : null}

      {pilotValidation ? (
        <div className="mb-10">
          <CommunityWorkbenchDefectLogPanel
            initialDefects={pilotDefects}
            operatorInitials={operatorInitials}
            workbenchSlug={workbench.slug}
          />
        </div>
      ) : null}

      <Section id="overview" title="Overview">
        <div className="ep-stat-grid">
          {workbench.voteCushion ? (
            <>
              <div className="ep-stat">
                <div className="ep-stat-value">
                  {formatVotes(
                    workbench.voteCushion.hasLocalCushion && workbench.voteCushion.localTargetVotes != null
                      ? workbench.voteCushion.localTargetVotes
                      : workbench.voteCushion.globalTargetVotes,
                  )}
                </div>
                <div className="ep-stat-label">
                  {workbench.voteCushion.hasLocalCushion ? "Local vote target" : "Vote target"}
                </div>
              </div>
              <div className="ep-stat">
                <div className="ep-stat-value">
                  {formatCushionPercent(
                    workbench.voteCushion.hasLocalCushion && workbench.voteCushion.localPercentIncrease != null
                      ? workbench.voteCushion.localPercentIncrease
                      : workbench.voteCushion.globalPercentIncrease,
                  )}
                </div>
                <div className="ep-stat-label">Required increase</div>
              </div>
              <div className="ep-stat">
                <div className="ep-stat-value">
                  +
                  {formatVotes(
                    workbench.voteCushion.hasLocalCushion && workbench.voteCushion.localVoteGain != null
                      ? workbench.voteCushion.localVoteGain
                      : workbench.voteCushion.globalVoteGain,
                  )}
                </div>
                <div className="ep-stat-label">Gain needed</div>
              </div>
            </>
          ) : (
            <>
              {workbench.voteTarget ? (
                <div className="ep-stat">
                  <div className="ep-stat-value">{formatVotes(workbench.voteTarget)}</div>
                  <div className="ep-stat-label">Vote target</div>
                </div>
              ) : null}
              {workbench.voteGain ? (
                <div className="ep-stat">
                  <div className="ep-stat-value">+{formatVotes(workbench.voteGain)}</div>
                  <div className="ep-stat-label">Est. gain needed</div>
                </div>
              ) : null}
            </>
          )}
          <div className="ep-stat">
            <div className="ep-stat-value">{workbench.fieldEntry.totalQuantity}</div>
            <div className="ep-stat-label">Field log total</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">{workbench.events.length}</div>
            <div className="ep-stat-label">Upcoming events</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">
              {workbench.leadership.filter((l) => l.personName).length}/{workbench.leadership.length}
            </div>
            <div className="ep-stat-label">Leadership filled</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          One template, completely local content. This workbench is where {workbench.name} teams run leadership,
          missions, events, relationships, and field logging — without waiting on statewide dashboards.
        </p>
        {workbench.slug === "sherwood" ? (
          <div className="mt-4 rounded-lg border border-[var(--ep-gold)] bg-[var(--ep-cream)] p-4 text-sm">
            <p className="font-heading font-bold text-[var(--ep-navy)]">Community events</p>
            <ul className="mt-2 space-y-2">
              {workbench.events
                .filter((e) => e.status !== "cancelled")
                .map((e) => {
                  const eventSlug = matchEventSlug(e.title);
                  const isGgs = eventSlug === GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG;
                  return (
                    <li key={e.id}>
                      <Link
                        href={
                          isGgs
                            ? grassrootsGuitarStringsEventHref()
                            : communityWorkbenchEventHref(workbench.slug, eventSlug)
                        }
                        className="font-semibold text-[var(--ep-navy)] hover:underline"
                      >
                        {e.title}
                      </Link>
                      {e.eventDate ? (
                        <span className="ml-2 text-xs text-[var(--ep-navy-muted)]">
                          · {new Date(e.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      ) : null}
                      {isGgs ? (
                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                          Event workbench · $20K profit KPI
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              {workbench.events.filter((e) => e.status !== "cancelled").length === 0 ? (
                <li className="text-xs italic text-[var(--ep-navy-muted)]">No events seeded yet — refresh after DB sync.</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </Section>

      {workbench.voteCushion ? (
        <CommunityWorkbenchVoteCushionPanel
          slug={workbench.slug}
          cushion={workbench.voteCushion}
          operatorInitials={operatorInitials}
        />
      ) : null}

      {fosAllocation ? (
        <Section id="fundraising" title="Fundraising">
          <CommunityFundraisingGoalPanel allocation={fosAllocation} />
          {workbench.slug === "sherwood" ? (
            <CommunityFundraisingOpportunitiesPanel allocation={fosAllocation} />
          ) : null}
        </Section>
      ) : null}

      <Section id="readiness" title="Community readiness">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workbench.readiness.dimensions.map((d) => (
            <ReadinessBar key={d.key} label={d.label} value={d.pct} />
          ))}
        </div>
      </Section>

      <Section id="leadership" title="Local leadership">
        <ul className="divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
          {workbench.leadership.map((row) => (
            <li key={row.roleKey} className="px-4 py-3">
              <LeadershipRow row={row} slug={workbench.slug} operatorInitials={operatorInitials} onSave={post} busy={busy} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="missions" title="Local mission board">
        <MissionAddForm slug={workbench.slug} onSave={post} busy={busy} operatorInitials={operatorInitials} />
        <ul className="mt-4 space-y-2">
          {workbench.missions.length === 0 ? (
            <li className="text-sm italic text-[var(--ep-navy-muted)]">No missions yet — add the first priority below.</li>
          ) : (
            workbench.missions.map((m) => (
              <li key={m.id} className="flex items-start gap-2 rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm">
                <span className={cn("mt-0.5 font-mono text-xs font-bold", m.status === "done" ? "text-emerald-700" : "text-[var(--ep-gold)]")}>
                  [{m.operatorInitials ?? "—"}]
                </span>
                <span className="font-medium text-[var(--ep-navy)]">{m.title}</span>
                <span className="ml-auto text-xs uppercase text-[var(--ep-navy-muted)]">{m.status}</span>
              </li>
            ))
          )}
        </ul>
      </Section>

      <Section id="kpis" title="Community KPI dashboard">
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Configurable per community — template: <strong>{workbench.kpiTemplate}</strong>
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {workbench.kpiMetrics.map((m) => (
            <li key={m.key} className="rounded-lg border border-[var(--ep-border)] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{m.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">
                {m.current ?? "—"}
                {m.target ? <span className="text-base font-normal text-[var(--ep-navy-muted)]"> / {m.target}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {workbench.countySlug ? (
        <Section id="field-log" title="Live field log">
          <ElectionPlanFieldEntryPanel
            countySlug={workbench.countySlug}
            countyName={workbench.countyName ?? workbench.countySlug}
            citySlug={workbench.citySlug}
            cityName={workbench.kind === "city" ? workbench.name : null}
            initial={workbench.fieldEntry}
            operatorInitials={operatorInitials}
          />
        </Section>
      ) : null}

      <Section id="committees" title="Committees">
        <SimpleAddForm
          label="Committee name"
          placeholder="Election Integrity Committee"
          operatorInitials={operatorInitials}
          busy={busy}
          onSubmit={async (name) => post("committee", { name })}
        />
        <ul className="mt-4 space-y-3">
          {workbench.committees.map((c) => (
            <li key={c.id} className="ep-card text-sm">
              <p className="font-heading font-bold text-[var(--ep-navy)]">
                <span className="font-mono text-xs text-[var(--ep-gold)]">[{c.operatorInitials}]</span> {c.name}
              </p>
              {c.goals ? <p className="mt-1 text-[var(--ep-navy-muted)]">{c.goals}</p> : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="events" title="Event command center">
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Field operations — run of show, volunteer roles, committee link, status pipeline, and after-action reports.
          Every save is tagged with operator initials.
        </p>
        <CommunityWorkbenchEventOpsPanel
          workbenchSlug={workbench.slug}
          events={workbench.events}
          committees={workbench.committees}
          operatorInitials={operatorInitials}
        />
      </Section>

      {coalitionProfile ? (
        <Section id="coalition-framework" title="Coalition framework">
          {coalitionProfile.frameworkNote ? (
            <p className="mb-4 rounded-lg border border-[var(--ep-gold)] bg-[var(--ep-cream)] px-4 py-3 text-sm text-[var(--ep-navy)]">
              {coalitionProfile.frameworkNote}
            </p>
          ) : null}
          {coalitionProfile.leadRole ? (
            <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
              Suggested lead role: <strong className="text-[var(--ep-navy)]">{coalitionProfile.leadRole}</strong>
            </p>
          ) : null}

          <h3 className="mb-2 font-heading text-base font-bold text-[var(--ep-navy)]">Intel framework slots</h3>
          <p className="mb-3 text-xs text-[var(--ep-navy-muted)]">
            Empty until coalition lead adds intel pages — each slot maps to the intel section dropdown below.
          </p>
          <ul className="mb-8 grid gap-2 sm:grid-cols-2">
            {coalitionProfile.intelSections.map((slot) => {
              const filled = workbench.intel.some((i) => i.sectionKey === slot.key);
              return (
                <li
                  key={slot.key}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    filled ? "border-emerald-300 bg-emerald-50" : "border-[var(--ep-border)] bg-white",
                  )}
                >
                  <p className="font-medium text-[var(--ep-navy)]">{slot.label}</p>
                  <p className="text-[10px] text-[var(--ep-navy-muted)]">
                    {filled ? "Intel page exists — see Local intel" : "Open slot"}
                  </p>
                </li>
              );
            })}
          </ul>

          <h3 className="mb-2 font-heading text-base font-bold text-[var(--ep-navy)]">Volunteer pathway framework</h3>
          <p className="mb-3 text-xs text-[var(--ep-navy-muted)]">
            Pathway labels are containers for recruitment — PPEN activation waits on pilot gate unless approved.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {coalitionProfile.volunteerPathways.map((path) => (
              <li key={path.key} className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-sm">
                <p className="font-medium text-[var(--ep-navy)]">{path.label}</p>
                {path.labelEs ? (
                  <p className="text-xs text-[var(--ep-navy-muted)]">{path.labelEs}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="intel" title="Local intelligence">
        {coalitionProfile ? (
          <p className="mb-3 text-sm text-[var(--ep-navy-muted)]">
            Coalition intel uses framework section keys from the registry — local leaders define org names and relationships inside each slot.
          </p>
        ) : (
          <p className="mb-3 text-sm text-[var(--ep-navy-muted)]">Local wiki — churches, employers, leaders, schools, history.</p>
        )}
        <IntelAddForm slug={workbench.slug} sectionOptions={intelSectionOptions} onSave={post} busy={busy} operatorInitials={operatorInitials} />
        <ul className="mt-4 space-y-3">
          {workbench.intel.map((i) => (
            <li key={i.id} className="ep-card text-sm">
              <p className="text-[10px] font-bold uppercase text-[var(--ep-gold)]">
                [{i.operatorInitials}] · {i.sectionKey}
              </p>
              <p className="font-heading font-bold text-[var(--ep-navy)]">{i.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-[var(--ep-navy-muted)]">{i.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="relationships" title="Relationship map">
        <RelationshipAddForm onSave={post} busy={busy} operatorInitials={operatorInitials} />
        <ul className="mt-4 space-y-2">
          {workbench.relationships.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline gap-2 rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm">
              <span className="font-mono text-xs font-bold text-[var(--ep-gold)]">[{r.operatorInitials}]</span>
              <strong className="text-[var(--ep-navy)]">{r.personName}</strong>
              {r.roleLabel ? <span className="text-[var(--ep-navy-muted)]">· {r.roleLabel}</span> : null}
              <span className="ml-auto text-xs tabular-nums">Strength {r.strength}%</span>
              {r.nextFollowUp ? (
                <span className="w-full text-xs text-[var(--ep-navy-muted)]">Next: {r.nextFollowUp}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="notebook" title="Community notebook">
        <NoteAddForm onSave={post} busy={busy} operatorInitials={operatorInitials} />
        <ul className="mt-4 space-y-3">
          {workbench.notes.map((n) => (
            <li key={n.id} className="ep-card text-sm">
              <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">
                [{n.operatorInitials}] · {n.noteType}
              </p>
              <p className="font-heading font-bold text-[var(--ep-navy)]">{n.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-[var(--ep-navy-muted)]">{n.body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function LeadershipRow({
  row,
  operatorInitials,
  onSave,
  busy,
}: {
  row: CommunityWorkbenchView["leadership"][number];
  slug: string;
  operatorInitials: string | null;
  onSave: (section: string, payload: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.personName ?? "");
  const [contact, setContact] = useState(row.contact ?? "");

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave("leadership", { roleKey: row.roleKey, personName: name, contact });
    if (ok) setEditing(false);
  };

  if (!editing && row.personName) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">{row.roleLabel}</span>
          <p className="font-medium text-[var(--ep-navy)]">
            {row.operatorInitials ? <span className="font-mono text-[var(--ep-gold)]">[{row.operatorInitials}] </span> : null}
            {row.personName}
          </p>
          {row.contact ? <p className="text-xs text-[var(--ep-navy-muted)]">{row.contact}</p> : null}
        </div>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold underline">
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="grid gap-2 sm:grid-cols-3">
      <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)] sm:col-span-3">{row.roleLabel}</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="rounded border px-2 py-1.5 text-sm"
        required
      />
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Contact"
        className="rounded border px-2 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={busy || !operatorInitials}
        className="rounded bg-[var(--ep-navy)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
      >
        {operatorInitials ? `[${operatorInitials}] Save` : "Sign in to assign"}
      </button>
    </form>
  );
}

function SimpleAddForm({
  label,
  placeholder,
  operatorInitials,
  busy,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  operatorInitials: string | null;
  busy: boolean;
  onSubmit: (value: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit(value.trim());
    if (ok) setValue("");
  };
  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <label className="sr-only">{label}</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-w-[12rem] flex-1 rounded border px-3 py-2 text-sm"
        required
      />
      <button
        type="submit"
        disabled={busy || !operatorInitials}
        className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {operatorInitials ? "Add" : "Sign in to add"}
      </button>
    </form>
  );
}

function MissionAddForm({
  onSave,
  busy,
  operatorInitials,
}: {
  slug: string;
  onSave: (section: string, payload: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  operatorInitials: string | null;
}) {
  const [title, setTitle] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave("mission", { title: title.trim() });
    if (ok) setTitle("");
  };
  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Current priority mission…"
        className="min-w-[12rem] flex-1 rounded border px-3 py-2 text-sm"
        required
      />
      <button type="submit" disabled={busy || !operatorInitials} className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        Add mission
      </button>
    </form>
  );
}

function IntelAddForm({
  onSave,
  busy,
  operatorInitials,
  sectionOptions,
}: {
  slug: string;
  onSave: (section: string, payload: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  operatorInitials: string | null;
  sectionOptions: Array<{ key: string; label: string }>;
}) {
  const [sectionKey, setSectionKey] = useState(sectionOptions[0]?.key ?? "leaders");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave("intel", { sectionKey, title, body });
    if (ok) {
      setTitle("");
      setBody("");
    }
  };
  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--ep-border)] p-3">
      <select value={sectionKey} onChange={(e) => setSectionKey(e.target.value)} className="w-full rounded border px-2 py-2 text-sm">
        {sectionOptions.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded border px-2 py-2 text-sm" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Local intelligence…" rows={3} className="w-full rounded border px-2 py-2 text-sm" required />
      <button type="submit" disabled={busy || !operatorInitials} className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        Add intel
      </button>
    </form>
  );
}

function RelationshipAddForm({
  onSave,
  busy,
  operatorInitials,
}: {
  onSave: (section: string, payload: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  operatorInitials: string | null;
}) {
  const [personName, setPersonName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave("relationship", { personName, roleLabel });
    if (ok) {
      setPersonName("");
      setRoleLabel("");
    }
  };
  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Person name" className="rounded border px-2 py-2 text-sm" required />
      <input value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} placeholder="Role" className="rounded border px-2 py-2 text-sm" />
      <button type="submit" disabled={busy || !operatorInitials} className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        Add relationship
      </button>
    </form>
  );
}

function NoteAddForm({
  onSave,
  busy,
  operatorInitials,
}: {
  onSave: (section: string, payload: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  operatorInitials: string | null;
}) {
  const [noteType, setNoteType] = useState("meeting");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave("note", { noteType, title, body });
    if (ok) {
      setTitle("");
      setBody("");
    }
  };
  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--ep-border)] p-3">
      <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="w-full rounded border px-2 py-2 text-sm">
        {COMMUNITY_NOTE_TYPES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded border px-2 py-2 text-sm" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notes…" rows={3} className="w-full rounded border px-2 py-2 text-sm" required />
      <button type="submit" disabled={busy || !operatorInitials} className="rounded bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        Add note
      </button>
    </form>
  );
}
