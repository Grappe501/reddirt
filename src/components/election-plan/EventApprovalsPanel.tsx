"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { cn } from "@/lib/utils";

type Props = {
  data: ElectionPlanWorkbenchSnapshot["eventApprovals"];
  standalone?: boolean;
};

type DecisionState = {
  kellyAttends: boolean;
  needsVolunteers: boolean;
  declined: boolean;
  verified: boolean;
  notes: string;
};

type ViewFilter = "week" | "pending" | "all";

const STORAGE_KEY = "kgrappe-event-approvals-v1";

function defaultDecision(
  item: ElectionPlanWorkbenchSnapshot["eventApprovals"]["items"][number],
): DecisionState {
  return {
    kellyAttends: item.decision.kellyAttends,
    needsVolunteers: item.decision.needsVolunteers,
    declined: item.decision.declined,
    verified: item.decision.verified,
    notes: item.decision.notes ?? "",
  };
}

function statusFromDecision(d: DecisionState): string {
  if (d.verified && !d.declined) return "Verified";
  if (d.declined) return "Not participating";
  if (d.kellyAttends && d.needsVolunteers) return "Kelly + volunteers";
  if (d.kellyAttends) return "Kelly attends";
  if (d.needsVolunteers) return "Volunteers needed";
  return "Pending";
}

function statusClass(status: string): string {
  if (status === "Not participating") return "bg-red-100 text-red-900";
  if (status === "Verified") return "bg-emerald-100 text-emerald-900";
  if (status === "Kelly + volunteers") return "bg-[var(--ep-gold-soft)] text-[var(--ep-navy)]";
  if (status === "Kelly attends") return "bg-blue-100 text-blue-900";
  if (status === "Volunteers needed") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function EventApprovalsPanel({ data, standalone }: Props) {
  const [view, setView] = useState<ViewFilter>("week");
  const [localDecisions, setLocalDecisions] = useState<Record<string, DecisionState>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, DecisionState>) : {};
    } catch {
      return {};
    }
  });
  const [exportOpen, setExportOpen] = useState(false);

  const getDecision = useCallback(
    (slug: string, item: ElectionPlanWorkbenchSnapshot["eventApprovals"]["items"][number]) =>
      localDecisions[slug] ?? defaultDecision(item),
    [localDecisions],
  );

  const persist = useCallback((slug: string, next: DecisionState) => {
    setLocalDecisions((prev) => {
      const merged = { ...prev, [slug]: next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        /* ignore quota */
      }
      return merged;
    });
  }, []);

  const updateDecision = useCallback(
    (
      slug: string,
      item: ElectionPlanWorkbenchSnapshot["eventApprovals"]["items"][number],
      patch: Partial<DecisionState>,
    ) => {
      const current = getDecision(slug, item);
      let next = { ...current, ...patch };
      if (patch.declined === true) {
        next = { ...next, kellyAttends: false, needsVolunteers: false };
      }
      if (patch.kellyAttends === true || patch.needsVolunteers === true) {
        next = { ...next, declined: false };
      }
      persist(slug, next);
    },
    [getDecision, persist],
  );

  const weekItems = useMemo(
    () =>
      data.items.filter(
        (i) => i.date >= data.approvalWeekStart && i.date <= data.approvalWeekEnd,
      ),
    [data],
  );

  const visibleItems = useMemo(() => {
    if (view === "week") return weekItems;
    if (view === "pending") {
      return data.items.filter((i) => statusFromDecision(getDecision(i.slug, i)) === "Pending");
    }
    return data.items;
  }, [view, data.items, weekItems, getDecision]);

  const exportPayload = useMemo(() => {
    const decisions: Record<string, Omit<DecisionState, "notes"> & { notes?: string }> = {};
    for (const item of data.items) {
      const d = getDecision(item.slug, item);
      if (statusFromDecision(d) === "Pending" && !localDecisions[item.slug]) continue;
      decisions[item.slug] = {
        kellyAttends: d.kellyAttends,
        needsVolunteers: d.needsVolunteers,
        declined: d.declined,
        verified: d.verified,
        ...(d.notes ? { notes: d.notes } : {}),
      };
    }
    return JSON.stringify({ decisions }, null, 2);
  }, [data.items, getDecision, localDecisions]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Event approval portal</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Week {data.approvalWeekStart} → {data.approvalWeekEnd} · through Election Day {data.electionDay}
          </p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=warRoom"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Executive War Room
          </Link>
        ) : null}
      </div>

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{data.explanation}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Check all that apply: <strong>Kelly will attend</strong> and/or <strong>We need volunteers</strong>. Use{" "}
          <strong>Will not participate</strong> to decline. Mark <strong>Verified</strong> when calendar truth is
          confirmed. Decisions save in this browser; export JSON to update{" "}
          <code className="text-[10px]">event-approvals.source.json</code>.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{data.pendingCount}</div>
          <div className="ep-stat-label">Pending decisions</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.verifiedCount}</div>
          <div className="ep-stat-label">Verified</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.declinedCount}</div>
          <div className="ep-stat-label">Declined</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.throughElectionCount}</div>
          <div className="ep-stat-label">Through Election Day</div>
        </div>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">This week on the calendar</h2>
      <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
        Full week context for logistics — all public calendar events during the approval window.
      </p>
      <div className="mb-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.weekCalendar.length === 0 ? (
          <p className="text-sm text-[var(--ep-navy-muted)]">No calendar events this week.</p>
        ) : (
          data.weekCalendar.map((ev) => {
            const d =
              localDecisions[ev.slug] ??
              ({
                kellyAttends: ev.decision.kellyAttends,
                needsVolunteers: ev.decision.needsVolunteers,
                declined: ev.decision.declined,
                verified: ev.decision.verified,
                notes: ev.decision.notes ?? "",
              } satisfies DecisionState);
            const status = statusFromDecision(d);
            return (
            <div key={ev.id} className="ep-card text-sm">
              <div className="font-mono text-xs text-[var(--ep-navy-muted)]">{ev.date}</div>
              <div className="mt-1 font-semibold">{ev.title}</div>
              <div className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                {ev.locationName} · {ev.county}
              </div>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  statusClass(status),
                )}
              >
                {status}
              </span>
            </div>
            );
          })
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["week", `Approval week (${weekItems.length})`],
            ["pending", `Pending (${data.pendingCount})`],
            ["all", `Through Nov (${data.throughElectionCount})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold",
              view === key
                ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                : "border-[var(--ep-border)] bg-white text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]",
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setExportOpen((o) => !o)}
          className="rounded-md border border-[var(--ep-gold)] px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-gold-soft)]"
        >
          {exportOpen ? "Hide export" : "Export decisions JSON"}
        </button>
      </div>

      {exportOpen ? (
        <div className="ep-card mb-8">
          <p className="mb-2 text-xs text-[var(--ep-navy-muted)]">
            Merge into <code>data/campaign-brain/event-approvals.source.json</code> →{" "}
            <code>npm run election-plan:build</code>
          </p>
          <textarea
            readOnly
            className="h-48 w-full rounded border border-[var(--ep-border)] bg-[var(--ep-cream)] p-3 font-mono text-xs"
            value={exportPayload}
          />
        </div>
      ) : null}

      <h2 className="mb-3 font-heading text-lg font-bold">Approve events</h2>
      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">County</th>
              <th className="py-2 pr-3">Kelly attends</th>
              <th className="py-2 pr-3">Need volunteers</th>
              <th className="py-2 pr-3">Not participating</th>
              <th className="py-2 pr-3">Verified</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const d = getDecision(item.slug, item);
              const status = statusFromDecision(d);
              return (
                <tr key={item.slug} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{item.date}</td>
                  <td className="py-2.5 pr-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-[var(--ep-navy-muted)]">{item.locationName}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-[var(--ep-navy-muted)]">{item.county}</td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="checkbox"
                      checked={d.kellyAttends}
                      disabled={d.declined}
                      onChange={(e) => updateDecision(item.slug, item, { kellyAttends: e.target.checked })}
                      aria-label={`Kelly attends ${item.title}`}
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="checkbox"
                      checked={d.needsVolunteers}
                      disabled={d.declined}
                      onChange={(e) => updateDecision(item.slug, item, { needsVolunteers: e.target.checked })}
                      aria-label={`Volunteers needed ${item.title}`}
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="checkbox"
                      checked={d.declined}
                      onChange={(e) => updateDecision(item.slug, item, { declined: e.target.checked })}
                      aria-label={`Not participating ${item.title}`}
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="checkbox"
                      checked={d.verified}
                      disabled={d.declined}
                      onChange={(e) => updateDecision(item.slug, item, { verified: e.target.checked })}
                      aria-label={`Verified ${item.title}`}
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        statusClass(status),
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <input
                      type="text"
                      className="w-full min-w-[8rem] rounded border border-[var(--ep-border)] px-2 py-1 text-xs"
                      value={d.notes}
                      placeholder="Optional note"
                      onChange={(e) => updateDecision(item.slug, item, { notes: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
        Intelligence queue:{" "}
        <Link href="/election-plan/intelligence-opportunities" className="font-semibold underline">
          scored opportunities through November →
        </Link>
      </p>
    </section>
  );
}
