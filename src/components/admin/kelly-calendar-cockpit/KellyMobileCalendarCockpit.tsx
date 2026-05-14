"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";
import type { CountyBasicsStrip } from "@/lib/calendar/kelly-county-basics";
import type { KellyItemStagedMetadata } from "@/lib/calendar/kelly-cockpit-staged-metadata";
import type { AiRecommendationApiItem, AiRecommendationsPostResponse } from "@/lib/calendar/ai-approval-recommendation-types";
import type { CalendarAlertDto, EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";
import type { WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";
import { KellyMobileApprovalEventCard } from "@/components/admin/kelly-calendar-cockpit/KellyMobileApprovalEventCard";
import { KellyPwaRegister } from "@/components/admin/kelly-calendar-cockpit/KellyPwaRegister";
import { KellyWeekendRouteStrip } from "@/components/admin/kelly-calendar-cockpit/KellyWeekendRouteStrip";

const TZ = "America/Chicago";

const EMPTY_STAGED: KellyItemStagedMetadata = {};

type Tab = "today" | "approvals" | "trips" | "counties" | "alerts";

function ymd(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

function cardBadgeClass(b: EnrichedCalendarItem["cardBadge"]): string {
  const m: Record<string, string> = {
    needs_approval: "bg-amber-100 text-amber-950 ring-1 ring-amber-300/50",
    tentative: "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-300/50",
    confirmed: "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300/50",
    conflict: "bg-rose-100 text-rose-950 ring-1 ring-rose-300/50",
    send_local: "bg-violet-100 text-violet-950 ring-1 ring-violet-300/50",
    needs_staff_follow_up: "bg-sky-100 text-sky-950 ring-1 ring-sky-300/50",
    staff_follow_up: "bg-sky-200 text-sky-950 ring-1 ring-sky-400/40",
    approved: "bg-emerald-200 text-emerald-950 ring-1 ring-emerald-400/40",
  };
  return m[b] ?? "bg-zinc-200 text-zinc-900";
}

function badgeLabel(b: EnrichedCalendarItem["cardBadge"]): string {
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

function EventCard({ it, basics }: { it: EnrichedCalendarItem; basics?: CountyBasicsStrip }) {
  return (
    <Link
      href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
      className="block rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-4 shadow-sm active:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-lg font-bold leading-snug tracking-tight text-zinc-900">{it.title}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[9px] font-bold uppercase tracking-wide ${cardBadgeClass(it.cardBadge)}`}>
          {badgeLabel(it.cardBadge)}
        </span>
      </div>
      <p className="mt-2 font-body text-sm text-zinc-600">
        {new Date(it.start).toLocaleString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" })}
        {it.county ? ` · ${it.county}` : ""}
      </p>
      {basics ? (
        <p className="mt-2 font-body text-[11px] text-zinc-500">
          Seat {basics.countySeat} · tier {basics.priorityTier}
        </p>
      ) : null}
      {it.notes ? <p className="mt-2 line-clamp-2 font-body text-xs text-zinc-500">{it.notes}</p> : null}
      {it.overnightRequired ? <p className="mt-2 font-body text-[11px] font-semibold text-amber-800/90">Overnight likely — confirm travel</p> : null}
    </Link>
  );
}

type Props = {
  enriched: EnrichedCalendarItem[];
  countyPriorities: CountyPrioritySnapshotRow[];
  alerts: CalendarAlertDto[];
  todayYmd: string;
  tomorrowYmd: string;
  weekEndYmd: string;
  countyBasicsByItemId: Record<string, CountyBasicsStrip>;
  stagedByItemId: Record<string, KellyItemStagedMetadata>;
  weekendRoutePlansPreview?: WeekendRoutePlan[];
  weekendRoutePlanStub?: (formData: FormData) => Promise<void>;
};

export function KellyMobileCalendarCockpit({
  enriched,
  countyPriorities,
  alerts,
  todayYmd,
  tomorrowYmd,
  weekEndYmd,
  countyBasicsByItemId,
  stagedByItemId,
  weekendRoutePlansPreview,
  weekendRoutePlanStub,
}: Props) {
  const [tab, setTab] = useState<Tab>("today");
  const [aiById, setAiById] = useState<AiRecommendationApiItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...enriched].sort((a, b) => a.sortKey - b.sortKey || a.start.localeCompare(b.start)),
    [enriched],
  );

  const todayItems = useMemo(() => enriched.filter((e) => ymd(e.start) === todayYmd), [enriched, todayYmd]);
  const tomorrowItems = useMemo(() => enriched.filter((e) => ymd(e.start) === tomorrowYmd), [enriched, tomorrowYmd]);
  const weekItems = useMemo(
    () => enriched.filter((e) => ymd(e.start) >= todayYmd && ymd(e.start) <= weekEndYmd),
    [enriched, todayYmd, weekEndYmd],
  );

  const approvals = useMemo(() => sorted.filter((i) => i.kellyApprovalState === "needs_kelly_review"), [sorted]);
  const approvalIdsKey = useMemo(() => approvals.map((a) => a.id).join(","), [approvals]);

  useEffect(() => {
    if (tab !== "approvals") return;
    const itemIds = approvalIdsKey.split(",").filter(Boolean);
    if (itemIds.length === 0) return;
    let cancelled = false;
    setAiLoading(true);
    setAiBanner(null);
    fetch("/api/admin/calendar-command-center/ai-recommendations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<AiRecommendationsPostResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setAiById(data.items);
        if (!data.openaiConfigured) {
          setAiBanner("OpenAI key not set — deterministic rules + cache only.");
        } else if (data.modelWarnings?.length) {
          setAiBanner(data.modelWarnings[0] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setAiBanner("Could not load AI recommendations (network or auth).");
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, approvalIdsKey]);

  const aiMap = useMemo(() => {
    const m = new Map<string, AiRecommendationApiItem>();
    for (const row of aiById) m.set(row.calendarItemId, row);
    return m;
  }, [aiById]);
  const trips = useMemo(
    () => enriched.filter((i) => i.eventType === "travel" || i.eventType === "overnight" || i.overnightRequired),
    [enriched],
  );

  const topCounties = useMemo(
    () => [...countyPriorities].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)).slice(0, 24),
    [countyPriorities],
  );

  const navBtn = (t: Tab, label: string, badge?: number) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 font-body text-[10px] font-bold uppercase tracking-wide ${
        tab === t ? "bg-zinc-900 text-white shadow-inner" : "text-zinc-500"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span className="absolute right-2 top-1 min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[9px] text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="rounded-t-3xl bg-gradient-to-b from-[#f7f2ea] to-[#efe8dd] px-3 pb-40 pt-1 text-zinc-900">
      <KellyPwaRegister />

      <div className="mb-5 rounded-2xl border border-amber-200/60 bg-white/70 px-4 py-3 font-body text-xs leading-relaxed text-amber-950 shadow-sm">
        <span className="font-bold">Home screen:</span> Safari → Share → Add to Home Screen. Opens as <em>Kelly Calendar</em>.
      </div>

      {tab === "today" ? (
        <div className="space-y-6">
          {weekendRoutePlansPreview?.length && weekendRoutePlanStub ? (
            <KellyWeekendRouteStrip plans={weekendRoutePlansPreview} action={weekendRoutePlanStub} />
          ) : null}
          <section>
            <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">Today</p>
            <div className="space-y-2">
              {todayItems.length ? (
                todayItems.map((it) => <EventCard key={it.id} it={it} basics={countyBasicsByItemId[it.id]} />)
              ) : (
                <p className="font-body text-sm text-zinc-500">Nothing on the travel board for today.</p>
              )}
            </div>
          </section>
          <section>
            <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">Tomorrow</p>
            <div className="space-y-2">
              {tomorrowItems.length ? (
                tomorrowItems.map((it) => <EventCard key={it.id} it={it} basics={countyBasicsByItemId[it.id]} />)
              ) : (
                <p className="font-body text-sm text-zinc-500">Clear tomorrow in workbook view.</p>
              )}
            </div>
          </section>
          <section>
            <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">This week</p>
            <div className="space-y-2">
              {weekItems.slice(0, 20).map((it) => (
                <EventCard key={it.id} it={it} basics={countyBasicsByItemId[it.id]} />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "approvals" ? (
        <div className="space-y-4">
          <p className="font-body text-xs text-zinc-500">
            Sorted: conflicts → within 72h → work window → Tuesday LR → travel → needs review → send-local → county value.
          </p>
          {aiBanner ? (
            <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 font-body text-xs text-amber-950">{aiBanner}</p>
          ) : null}
          {approvals.map((it) => (
            <KellyMobileApprovalEventCard
              key={it.id}
              it={it}
              ai={aiMap.get(it.id)}
              aiLoading={aiLoading}
              countyBasics={countyBasicsByItemId[it.id]!}
              staged={stagedByItemId[it.id] ?? EMPTY_STAGED}
            />
          ))}
          {approvals.length === 0 ? <p className="font-body text-sm text-zinc-500">No items waiting on Kelly right now.</p> : null}
        </div>
      ) : null}

      {tab === "trips" ? (
        <div className="space-y-2">
          {trips.map((it) => (
            <EventCard key={it.id} it={it} basics={countyBasicsByItemId[it.id]} />
          ))}
          {trips.length === 0 ? <p className="text-sm text-zinc-500">No travel rows flagged.</p> : null}
        </div>
      ) : null}

      {tab === "counties" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {topCounties.map((c) => (
            <div key={c.county} className="rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-3 shadow-sm">
              <p className="font-heading text-sm font-bold text-zinc-900">{c.county}</p>
              <p className="font-body text-[10px] text-zinc-500">Tier {c.tier ?? "—"} · score {c.priorityScore ?? "—"}</p>
              {c.underTouched ? <p className="mt-1 text-[10px] font-bold text-amber-700">Under-touched</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "alerts" ? (
        <div className="space-y-2">
          {alerts.length === 0 ? <p className="text-sm text-zinc-500">No active in-app alerts.</p> : null}
          {alerts.map((a) => (
            <div key={a.id} className="rounded-2xl border border-zinc-200/80 bg-white/85 px-3 py-3 shadow-sm">
              <p className="font-body text-sm font-bold text-zinc-900">{a.title}</p>
              <p className="mt-1 font-body text-[11px] text-zinc-600">{a.body}</p>
              <Link
                href={`/admin/calendar-command-center/event/${encodeURIComponent(a.calendarItemId)}`}
                className="mt-2 inline-block font-body text-[11px] font-semibold text-sky-800 underline-offset-2 hover:underline"
              >
                Open event
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/90 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-1">
          {navBtn("today", "Today")}
          {navBtn("approvals", "Approvals", approvals.length)}
          {navBtn("trips", "Trips", trips.length)}
          {navBtn("counties", "Counties")}
          {navBtn("alerts", "Alerts", alerts.length)}
        </div>
      </nav>
    </div>
  );
}
