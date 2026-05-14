"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";
import { jitterLatLng } from "@/lib/calendar/build-week-board-model";
import {
  buildDaySegmentPreviews,
  filterItemsInChicagoWeek,
} from "@/lib/calendar/schedule-settlement-compute";
import type {
  DecisionTonightItem,
  RouteComparisonThree,
  ScheduleSettlementRecommendation,
  SettlementSnapshot,
} from "@/lib/calendar/schedule-settlement-types";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";
import type { CommunityOpportunity, WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";
import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";

import { appendScheduleSettlementDecision } from "@/app/admin/calendar-command-center/schedule-settlement-actions";
import { KellySettlementMap, type SettlementMapPin } from "@/components/admin/kelly-calendar-cockpit/KellySettlementMap";

const TZ = "America/Chicago";

type RecommendedWeek = {
  title: string;
  counties: string[];
  eventCount: number;
  estDriveMinutes: number;
  estDriveMiles: number;
  overnightCities: string[];
  workExceptions: number;
  risk: string;
  staffLine: string;
};

type Props = {
  enriched: EnrichedCalendarItem[];
  countyPriorities: CountyPrioritySnapshotRow[];
  todayYmd: string;
  weekEndYmd: string;
  weekMondayYmd: string;
  weekendPlans: WeekendRoutePlan[];
  opportunities: CommunityOpportunity[];
  snapshot: SettlementSnapshot;
  comparison: RouteComparisonThree;
  decisions: DecisionTonightItem[];
  dayPreview: ReturnType<typeof buildDaySegmentPreviews>;
  recommendedWeek: RecommendedWeek;
  approvalQueue: EnrichedCalendarItem[];
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function KellyScheduleSettlementDashboard(props: Props) {
  const {
    enriched,
    countyPriorities,
    todayYmd,
    weekEndYmd,
    weekMondayYmd,
    weekendPlans,
    opportunities,
    snapshot,
    comparison,
    decisions,
    dayPreview,
    recommendedWeek,
    approvalQueue,
  } = props;

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [ai, setAi] = useState<ScheduleSettlementRecommendation | null>(null);
  const [aiMeta, setAiMeta] = useState<string | null>(null);

  const weekItems = useMemo(() => filterItemsInChicagoWeek(enriched, weekMondayYmd), [enriched, weekMondayYmd]);

  const { pins, polyline } = useMemo(() => {
    const sorted = [...weekItems].sort((a, b) => a.start.localeCompare(b.start));
    const pinsOut: SettlementMapPin[] = [];
    const poly: [number, number][] = [];
    for (const it of sorted) {
      const county = it.county?.trim();
      const base = county ? approxCountyCenter(county) : { lat: 34.75, lng: -92.35 };
      const { lat, lng } = jitterLatLng(it.id, base.lat, base.lng);
      let lane: SettlementMapPin["lane"] = "other";
      if (it.eventType === "travel" || it.eventType === "overnight") lane = "travel";
      else if (it.calendarStatus === "confirmed") lane = "confirmed";
      else if (["tentative", "needs_verification", "recommended"].includes(it.calendarStatus)) lane = "tentative";
      pinsOut.push({ id: it.id, title: it.title, lat, lng, lane, county });
      poly.push([lat, lng]);
    }
    return { pins: pinsOut, polyline: poly };
  }, [weekItems]);

  const selectedItem = useMemo(
    () => (selectedPinId ? enriched.find((e) => e.id === selectedPinId) ?? null : null),
    [enriched, selectedPinId],
  );

  const countyRow = useMemo(
    () => (selectedCounty ? countyPriorities.find((c) => c.county === selectedCounty) ?? null : null),
    [countyPriorities, selectedCounty],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/kelly-agent/schedule-settlement", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekMondayYmd }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<{
          ok: boolean;
          recommendation?: ScheduleSettlementRecommendation;
          usedFallback?: boolean;
          openaiModel?: string | null;
        }>;
      })
      .then((j) => {
        if (cancelled || !j.ok || !j.recommendation) return;
        setAi(j.recommendation);
        setAiMeta(j.usedFallback ? "Deterministic / pack fallback" : `Model: ${j.openaiModel ?? "—"}`);
      })
      .catch(() => {
        if (!cancelled) setAiMeta("Could not load settlement recommendation.");
      });
    return () => {
      cancelled = true;
    };
  }, [weekMondayYmd]);

  const oppById = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f0e8] via-[#efe8dd] to-[#e8e0d4] pb-24 text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white/80 px-4 py-5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-900/60">Kelly cockpit</p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">Schedule settlement mode</h1>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-zinc-600">
              Tonight: lock the week and weekend arcs without leaving this board. Map stays visible — pins open cards here, not a spreadsheet rabbit hole.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-body text-xs font-semibold">
            <Link
              href="/admin/calendar-command-center/week"
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-50"
            >
              Week view
            </Link>
            <Link
              href="/admin/calendar-command-center/opportunities"
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-50"
            >
              Opportunities
            </Link>
            <span className="rounded-full bg-emerald-900 px-3 py-1.5 text-white">Today {todayYmd}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-2 md:gap-8 md:px-8">
        <section className="space-y-4 md:col-span-1">
          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Live map</p>
            <p className="mt-1 font-body text-xs text-zinc-600">
              <span className="font-semibold text-emerald-800">Green</span> confirmed ·{" "}
              <span className="font-semibold text-amber-900">Amber dashed</span> tentative ·{" "}
              <span className="font-semibold text-sky-900">Blue</span> travel · Rose Bud origin in rose.
            </p>
            <div className="mt-3">
              <KellySettlementMap pins={pins} polyline={polyline} selectedId={selectedPinId} onSelectPin={setSelectedPinId} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Route comparison</p>
            <div className="mt-3 grid gap-3 md:grid-cols-1">
              {[comparison.optionA, comparison.optionB, comparison.optionC].map((opt) => (
                <div key={opt.id + opt.label} className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-3">
                  <p className="font-heading text-sm font-bold text-zinc-900">{opt.label}</p>
                  <p className="mt-1 font-body text-[11px] text-zinc-600">
                    {opt.counties.slice(0, 6).join(" · ")}
                    {opt.counties.length > 6 ? " …" : ""}
                  </p>
                  <p className="mt-1 font-body text-[11px] text-zinc-600">
                    Drive {opt.driveMiles ?? "—"} mi · {opt.driveMinutes ?? "—"} min · risk {opt.riskLabel} · conflicts{" "}
                    {opt.conflicts}
                  </p>
                  <p className="mt-2 line-clamp-2 font-body text-[10px] text-zinc-700">AI: {opt.aiRecommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 md:col-span-1">
          <div className="rounded-2xl border border-emerald-900/15 bg-emerald-950/[0.03] p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-900/70">Tonight snapshot</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ["Confirmed", snapshot.confirmedThisWeek],
                ["Tentative", snapshot.tentativeThisWeek],
                ["Travel", snapshot.travelBlocksThisWeek],
                ["Overnights", snapshot.overnightsThisWeek],
                ["Conflicts", snapshot.conflictsThisWeek],
                ["Work exceptions", snapshot.workExceptionsThisWeek],
                ["Google synced ~", snapshot.googleSyncedApprox],
                ["Google attention ~", snapshot.googleNeedsAttentionApprox],
                ["Queue (14d)", snapshot.pendingDecisionsApprox],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg border border-zinc-200/60 bg-white px-2 py-2">
                  <p className="font-body text-[9px] font-bold uppercase tracking-wide text-zinc-500">{k}</p>
                  <p className="font-heading text-lg font-bold text-zinc-900">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-body text-[10px] text-zinc-500">
              Week window {weekMondayYmd} → {weekEndYmd} (Chicago).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Recommended week route</p>
            <p className="mt-2 font-heading text-lg font-bold text-zinc-900">{recommendedWeek.title}</p>
            <p className="mt-1 font-body text-sm text-zinc-700">{recommendedWeek.staffLine}</p>
            <ul className="mt-2 list-inside list-disc font-body text-xs text-zinc-600">
              <li>
                {recommendedWeek.eventCount} events · {recommendedWeek.counties.length} counties
              </li>
              <li>
                ~{recommendedWeek.estDriveMiles} mi · ~{recommendedWeek.estDriveMinutes} min (rough envelope)
              </li>
              <li>Risk: {recommendedWeek.risk.replace(/_/g, " ")}</li>
              {recommendedWeek.overnightCities.length ? <li>Overnights: {recommendedWeek.overnightCities.join(", ")}</li> : null}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={appendScheduleSettlementDecision}>
                <input type="hidden" name="settlementAction" value="approve_week_route" />
                <button type="submit" className="rounded-lg bg-emerald-800 px-3 py-2 font-body text-[10px] font-bold uppercase text-white">
                  Approve week route
                </button>
              </form>
              <form action={appendScheduleSettlementDecision}>
                <input type="hidden" name="settlementAction" value="modify_week_route" />
                <button type="submit" className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-body text-[10px] font-bold uppercase text-zinc-800">
                  Modify week route
                </button>
              </form>
              <form action={appendScheduleSettlementDecision}>
                <input type="hidden" name="settlementAction" value="hold_week_route" />
                <button type="submit" className="rounded-lg border border-zinc-200 px-3 py-2 font-body text-[10px] font-bold uppercase text-zinc-600">
                  Hold week route
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">AI settlement recommendation</p>
            {ai ? (
              <div className="mt-2 space-y-2">
                <p className="font-heading text-base font-bold text-zinc-900">{ai.headline}</p>
                <p className="font-body text-[10px] font-semibold uppercase text-emerald-900/80">{ai.recommendation.replace(/_/g, " ")}</p>
                <ul className="list-inside list-disc font-body text-xs text-zinc-700">
                  {ai.why.slice(0, 5).map((w) => (
                    <li key={w.slice(0, 40)}>{w}</li>
                  ))}
                </ul>
                {ai.risks.length ? (
                  <p className="font-body text-[11px] text-rose-800">
                    <span className="font-bold">Risks:</span> {ai.risks.slice(0, 4).join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 font-body text-sm text-zinc-500">Loading recommendation…</p>
            )}
            {aiMeta ? <p className="mt-2 font-body text-[10px] text-zinc-500">{aiMeta}</p> : null}
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Decision needed tonight</p>
            <ul className="mt-2 divide-y divide-zinc-100">
              {decisions.map((d) => (
                <li key={d.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (d.kind === "county" && d.targetId) setSelectedCounty(d.targetId);
                    }}
                    className="w-full text-left font-body text-sm font-semibold text-zinc-900 hover:text-emerald-900"
                  >
                    {d.label}
                  </button>
                  {d.hint ? <p className="font-body text-[10px] text-zinc-500">{d.hint}</p> : null}
                </li>
              ))}
            </ul>
            {countyRow ? (
              <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2">
                <p className="font-heading text-xs font-bold text-emerald-950">{countyRow.county}</p>
                <p className="font-body text-[10px] text-emerald-900/90">
                  Tier {countyRow.tier ?? "—"} · score {countyRow.priorityScore ?? "—"}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-8">
        <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Weekend route cards</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {weekendPlans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg font-bold text-zinc-950">{p.title}</p>
                    <p className="mt-1 font-body text-xs text-zinc-600">
                      Week start {p.weekStart} · {p.countiesTouched} counties · {p.mustAttendCount} must-attend · ~{p.totalDriveMiles} mi /{" "}
                      {p.totalDriveMinutes} min
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-1 font-body text-[9px] font-bold uppercase text-white">
                    {p.staffRecommendation.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 font-body text-[10px] text-zinc-700 sm:grid-cols-4">
                  {(["friday", "saturday", "sunday", "monday"] as const).map((day) => {
                    const slots = p.opportunities.filter((o) => o.day === day);
                    return (
                      <div key={day} className="rounded-lg border border-zinc-200/70 bg-white/80 px-2 py-2">
                        <p className="font-bold capitalize text-zinc-900">{day}</p>
                        <p className="mt-1 text-zinc-600">{slots.length} stops</p>
                      </div>
                    );
                  })}
                </div>
                {p.overnightStops.length ? (
                  <p className="mt-2 font-body text-[11px] text-amber-900">
                    Overnight: {p.overnightStops.map((o) => `${o.city} (${o.night})`).join(" · ")}
                  </p>
                ) : null}
                {p.risks.length ? (
                  <p className="mt-2 font-body text-[11px] text-rose-800">
                    <span className="font-bold">Buffer risk:</span> {p.risks.slice(0, 3).join(" · ")}
                  </p>
                ) : null}
                <ul className="mt-2 max-h-28 overflow-auto font-body text-[10px] text-zinc-600">
                  {p.opportunities.slice(0, 8).map((s) => (
                    <li key={s.opportunityId + s.day}>
                      {s.day}: {oppById.get(s.opportunityId)?.title ?? s.opportunityId} · {s.travelFromPreviousMiles} mi prev leg
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="approve_weekend_route" />
                    <input type="hidden" name="planId" value={p.id} />
                    <button type="submit" className="rounded-lg bg-emerald-800 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-white">
                      Approve route
                    </button>
                  </form>
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="modify_weekend_route" />
                    <input type="hidden" name="planId" value={p.id} />
                    <button type="submit" className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-zinc-800">
                      Modify
                    </button>
                  </form>
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="split_weekend_route" />
                    <input type="hidden" name="planId" value={p.id} />
                    <button type="submit" className="rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-violet-950">
                      Split / local
                    </button>
                  </form>
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="hold_weekend_route" />
                    <input type="hidden" name="planId" value={p.id} />
                    <button type="submit" className="rounded-lg border border-zinc-200 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-zinc-600">
                      Hold
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          {weekendPlans.length === 0 ? (
            <p className="mt-2 font-body text-sm text-zinc-500">No weekend route plans in JSON for this window.</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Day / hour preview (buffers)</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dayPreview.map((d) => (
              <div key={d.segment} className="rounded-xl border border-zinc-200/70 bg-zinc-50/80 px-3 py-2">
                <p className="font-heading text-xs font-bold capitalize text-zinc-900">{d.segment}</p>
                <p className="mt-1 font-body text-[10px] text-zinc-600">+{d.bufferMinutes} min buffer</p>
                <p className="mt-1 font-body text-[10px] text-zinc-700">{d.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Approval queue (next 14 days, focused)</p>
          <ul className="mt-2 divide-y divide-zinc-100">
            {approvalQueue.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <button
                    type="button"
                    className="text-left font-body text-sm font-semibold text-emerald-950 hover:underline"
                    onClick={() => setSelectedPinId(it.id)}
                  >
                    {it.title}
                  </button>
                  <p className="font-body text-[10px] text-zinc-500">
                    {it.county ?? "—"} · {fmt(it.start)} · {it.cardBadge.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="send_local_event" />
                    <input type="hidden" name="calendarItemId" value={it.id} />
                    <button type="submit" className="rounded-md border border-violet-300 bg-violet-50 px-2 py-1 font-body text-[9px] font-bold uppercase text-violet-950">
                      Send local
                    </button>
                  </form>
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="needs_staff_call" />
                    <input type="hidden" name="calendarItemId" value={it.id} />
                    <button type="submit" className="rounded-md border border-sky-300 bg-sky-50 px-2 py-1 font-body text-[9px] font-bold uppercase text-sky-950">
                      Staff call
                    </button>
                  </form>
                  <form action={appendScheduleSettlementDecision}>
                    <input type="hidden" name="settlementAction" value="mark_google_later" />
                    <input type="hidden" name="calendarItemId" value={it.id} />
                    <button type="submit" className="rounded-md border border-zinc-200 px-2 py-1 font-body text-[9px] font-bold uppercase text-zinc-600">
                      Google later
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          {approvalQueue.length === 0 ? <p className="font-body text-sm text-zinc-500">Nothing urgent in the focused queue.</p> : null}
        </section>

        {selectedItem ? (
          <section className="rounded-2xl border border-emerald-900/20 bg-white p-4 shadow-md">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Selected event</p>
            <p className="mt-1 font-heading text-xl font-bold text-zinc-950">{selectedItem.title}</p>
            <p className="mt-1 font-body text-sm text-zinc-600">{fmt(selectedItem.start)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/calendar-command-center/event/${encodeURIComponent(selectedItem.id)}`}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-body text-[10px] font-bold uppercase text-zinc-800"
              >
                Open full record
              </Link>
              <form action={appendScheduleSettlementDecision}>
                <input type="hidden" name="settlementAction" value="add_to_tentative" />
                <input type="hidden" name="calendarItemId" value={selectedItem.id} />
                <button type="submit" className="rounded-lg bg-amber-700 px-3 py-2 font-body text-[10px] font-bold uppercase text-white">
                  Add to tentative
                </button>
              </form>
              <form action={appendScheduleSettlementDecision}>
                <input type="hidden" name="settlementAction" value="hide_from_kelly" />
                <input type="hidden" name="calendarItemId" value={selectedItem.id} />
                <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 font-body text-[10px] font-bold uppercase text-zinc-700">
                  Hide from Kelly
                </button>
              </form>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
