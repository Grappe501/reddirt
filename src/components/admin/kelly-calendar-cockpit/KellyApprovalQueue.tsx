"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AiRecommendationApiItem, AiRecommendationsPostResponse } from "@/lib/calendar/ai-approval-recommendation-types";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";

function badgeClass(b: EnrichedCalendarItem["cardBadge"]): string {
  const m: Record<string, string> = {
    needs_approval: "bg-amber-500 text-black",
    tentative: "bg-amber-200 text-amber-950",
    confirmed: "bg-emerald-600 text-white",
    conflict: "bg-rose-600 text-white",
    send_local: "bg-violet-600 text-white",
    needs_staff_follow_up: "bg-sky-600 text-white",
    staff_follow_up: "bg-sky-800 text-white",
    approved: "bg-emerald-800 text-white",
  };
  return m[b] ?? "bg-zinc-600 text-white";
}

function label(b: EnrichedCalendarItem["cardBadge"]): string {
  const m: Record<string, string> = {
    needs_approval: "Needs approval",
    tentative: "Tentative",
    confirmed: "Confirmed",
    conflict: "Conflict",
    send_local: "Send local",
    needs_staff_follow_up: "Needs verification",
    staff_follow_up: "Staff follow-up",
    approved: "Approved",
  };
  return m[b] ?? b;
}

type Props = {
  items: EnrichedCalendarItem[];
};

export function KellyApprovalQueue({ items }: Props) {
  const [q, setQ] = useState("");
  const [aiById, setAiById] = useState<AiRecommendationApiItem[]>([]);
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.sortKey - b.sortKey || a.start.localeCompare(b.start)),
    [items],
  );
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sorted;
    return sorted.filter((x) => x.title.toLowerCase().includes(t) || (x.county ?? "").toLowerCase().includes(t));
  }, [sorted, q]);

  const approvalIdsKey = useMemo(
    () =>
      sorted
        .filter((i) => i.kellyApprovalState === "needs_kelly_review")
        .slice(0, 32)
        .map((i) => i.id)
        .join(","),
    [sorted],
  );

  useEffect(() => {
    const itemIds = approvalIdsKey.split(",").filter(Boolean);
    if (itemIds.length === 0) return;
    let cancelled = false;
    fetch("/api/admin/calendar-command-center/ai-recommendations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    })
      .then(async (r) => {
        if (!r.ok) return;
        return r.json() as Promise<AiRecommendationsPostResponse>;
      })
      .then((data) => {
        if (!data || cancelled) return;
        setAiById(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [approvalIdsKey]);

  const aiMap = useMemo(() => {
    const m = new Map<string, AiRecommendationApiItem>();
    for (const row of aiById) m.set(row.calendarItemId, row);
    return m;
  }, [aiById]);

  return (
    <div className="rounded-lg border border-kelly-text/12 bg-white shadow-sm">
      <div className="border-b border-kelly-text/10 px-3 py-2">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Approval queue</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter…"
          className="mt-2 w-full rounded border border-kelly-text/15 px-2 py-1 font-body text-xs"
        />
      </div>
      <ul className="max-h-[min(70vh,560px)] divide-y divide-kelly-text/8 overflow-auto">
        {list.slice(0, 80).map((it) => (
          <li key={it.id} className="px-3 py-2 hover:bg-kelly-wash/50">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                  className="block truncate font-body text-sm font-semibold text-kelly-text underline-offset-2 hover:underline"
                >
                  {it.title}
                </Link>
                <p className="mt-0.5 font-body text-[10px] text-kelly-muted">
                  {it.county ?? "—"} · {new Date(it.start).toLocaleString("en-US", { timeZone: "America/Chicago" })}
                </p>
                {(() => {
                  const row = aiMap.get(it.id);
                  return row?.recommendation?.headline ? (
                    <p className="mt-1 line-clamp-2 font-body text-[10px] text-kelly-muted">AI: {row.recommendation.headline}</p>
                  ) : null;
                })()}
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-body text-[9px] font-bold ${badgeClass(it.cardBadge)}`}>
                {label(it.cardBadge)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
