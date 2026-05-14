"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";
import { jitterLatLng, normalizeCountyKey } from "@/lib/calendar/build-week-board-model";
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
import type { KellyWinTargetScenarioFile } from "@/lib/election-targets/win-target-types";
import type { VolunteerCapacityModelFile } from "@/lib/field-ops/volunteer-capacity-types";
import type { CandidateDashboardPreflightFile } from "@/lib/kelly-agent/tools/candidate-dashboard-preflight-tool";
import { WinTargetHud } from "@/components/admin/kelly-calendar-cockpit/WinTargetHud";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";

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
  winScenario: KellyWinTargetScenarioFile | null;
  volunteerCapacityModel: VolunteerCapacityModelFile | null;
  preflight: CandidateDashboardPreflightFile;
  coveragePlans: CampaignEventCoveragePlan[];
  dataSourceMode: "db_backed" | "mixed" | "staged_fallback";
  dataSourceNote: string;
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
    winScenario,
    volunteerCapacityModel,
    preflight,
    coveragePlans,
    dataSourceMode,
    dataSourceNote,
  } = props;

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [ai, setAi] = useState<ScheduleSettlementRecommendation | null>(null);
  const [aiMeta, setAiMeta] = useState<string | null>(null);

  const weekItems = useMemo(() => filterItemsInChicagoWeek(enriched, weekMondayYmd), [enriched, weekMondayYmd]);

  const winByCounty = useMemo(() => {
    if (!winScenario) return null;
    return new Map(winScenario.counties.map((c) => [c.county, c]));
  }, [winScenario]);

  const maxPinGain = useMemo(() => {
    if (!winByCounty) return 1;
    let m = 1;
    for (const it of weekItems) {
      const key = normalizeCountyKey(it.county);
      if (!key) continue;
      const w = winByCounty.get(key);
      if (w && w.targetVoteGain > m) m = w.targetVoteGain;
    }
    return m;
  }, [weekItems, winByCounty]);

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
      const ck = normalizeCountyKey(county);
      let winAccent: number | undefined;
      if (ck && winByCounty && maxPinGain > 0) {
        const w = winByCounty.get(ck);
        if (w && w.targetVoteGain > 0) winAccent = Math.min(1, w.targetVoteGain / maxPinGain);
      }
      pinsOut.push({ id: it.id, title: it.title, lat, lng, lane, county, winAccent });
      poly.push([lat, lng]);
    }
    return { pins: pinsOut, polyline: poly };
  }, [weekItems, winByCounty, maxPinGain]);

  const selectedItem = useMemo(
    () => (selectedPinId ? enriched.find((e) => e.id === selectedPinId) ?? null : null),
    [enriched, selectedPinId],
  );

  const countyRow = useMemo(
    () => (selectedCounty ? countyPriorities.find((c) => c.county === selectedCounty) ?? null : null),
    [countyPriorities, selectedCounty],
  );

  const winSelected = useMemo(() => {
    if (!selectedCounty || !winByCounty) return null;
    return winByCounty.get(selectedCounty) ?? null;
  }, [selectedCounty, winByCounty]);

  const capByCounty = useMemo(() => {
    if (!volunteerCapacityModel) return null;
    return new Map(volunteerCapacityModel.counties.map((c) => [c.county, c]));
  }, [volunteerCapacityModel]);

  const capSelected = useMemo(() => {
    if (!selectedCounty || !capByCounty) return null;
    return capByCounty.get(selectedCounty) ?? null;
  }, [selectedCounty, capByCounty]);

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
  const coverageByItemId = useMemo(() => {
    const map = new Map<string, CampaignEventCoveragePlan>();
    for (const plan of coveragePlans) {
      if (plan.calendarItemId) map.set(plan.calendarItemId, plan);
      map.set(plan.campaignEventId, plan);
    }
    return map;
  }, [coveragePlans]);
  const preflightTone =
    preflight.overallStatus === "green"
      ? {
          label: "Ready for Kelly preview",
          className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
        }
      : preflight.overallStatus === "yellow"
        ? {
            label: "Usable, but staged",
            className: "border-amber-400/50 bg-amber-400/10 text-amber-100",
          }
        : {
            label: "Do not send yet",
            className: "border-rose-400/50 bg-rose-500/10 text-rose-100",
          };

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(56,189,248,0.08),transparent_45%)] pb-28 text-zinc-50">
      <div className={`border-b px-4 py-3 md:px-8 ${preflightTone.className}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] opacity-80">Candidate dashboard preflight</p>
            <p className="mt-1 font-heading text-lg font-bold">{preflightTone.label}</p>
            <p className="mt-1 font-body text-xs opacity-85">
              Mode: {preflight.recommendedUseMode.replace(/_/g, " ")} · Schedule week {preflight.scheduleReadiness.weekStart} · Next:{" "}
              {preflight.scheduleReadiness.recommendedNextDecision}
            </p>
          </div>
          <div className="max-w-xl font-body text-[11px] opacity-90">
            {preflight.blockers.length ? (
              <p>
                <span className="font-bold">Blockers:</span> {preflight.blockers.slice(0, 3).join(" · ")}
              </p>
            ) : (
              <p>
                <span className="font-bold">Ready:</span> {preflight.readyFeatures.slice(0, 4).join(" · ")}
              </p>
            )}
            {preflight.warnings.length ? <p className="mt-1">Warnings: {preflight.warnings.slice(0, 3).join(" · ")}</p> : null}
          </div>
        </div>
      </div>
      <div
        className={`border-b px-4 py-2 font-body text-xs md:px-8 ${
          dataSourceMode === "db_backed"
            ? "border-emerald-900/40 bg-emerald-950/30 text-emerald-100"
            : "border-amber-900/50 bg-amber-950/35 text-amber-100"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <span className="font-bold">Calendar data source:</span>{" "}
          {dataSourceMode === "db_backed" ? "DB-backed" : dataSourceMode === "mixed" ? "Mixed" : "Staged fallback"} · {dataSourceNote}
          {dataSourceMode !== "db_backed" ? " Decisions may not persist to production DB until staged rows are promoted." : ""}
        </div>
      </div>
      <div className="border-b border-zinc-800/90 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <WinTargetHud scenario={winScenario} />
        </div>
      </div>

      <header className="border-b border-zinc-800/80 bg-zinc-950/70 px-4 py-5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400/80">Kelly cockpit</p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">Schedule settlement mode</h1>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-zinc-400">
              Instrument panel: lock the week and weekend arcs without drowning in raw opportunity rows. Map stays visible — pins open cards here. Win-target math is advisory; you approve every commit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-body text-xs font-semibold">
            <Link
              href="/admin/calendar-command-center/week"
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-zinc-100 hover:border-emerald-600/60 hover:text-white"
            >
              Week view
            </Link>
            <Link
              href="/admin/calendar-command-center/opportunities"
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-zinc-100 hover:border-emerald-600/60 hover:text-white"
            >
              Opportunities
            </Link>
            <Link
              href="/admin/calendar-command-center/build-status"
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-zinc-100 hover:border-emerald-600/60 hover:text-white"
            >
              Build status
            </Link>
            <Link
              href="/admin/calendar-command-center/field-ops"
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-zinc-100 hover:border-emerald-600/60 hover:text-white"
            >
              Field ops
            </Link>
            <span className="rounded-full bg-emerald-700 px-3 py-1.5 text-white shadow-lg shadow-emerald-900/40">Today {todayYmd}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-12 md:gap-8 md:px-8">
        <section className="space-y-4 md:col-span-7">
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/40 p-4 shadow-xl shadow-black/40 ring-1 ring-white/5">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Live map</p>
            <p className="mt-1 font-body text-xs text-zinc-400">
              <span className="font-semibold text-emerald-400">Emerald</span> confirmed ·{" "}
              <span className="font-semibold text-amber-300">Amber dashed</span> tentative ·{" "}
              <span className="font-semibold text-sky-300">Sky</span> travel · Pin halo = modeled target vote gain (relative week).
            </p>
            <div className="mt-3">
              <KellySettlementMap pins={pins} polyline={polyline} selectedId={selectedPinId} onSelectPin={setSelectedPinId} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-700/80 bg-white/[0.04] p-4 shadow-lg shadow-black/30 ring-1 ring-white/5 backdrop-blur-sm">
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

        <section className="space-y-4 md:col-span-5">
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
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/40 px-3 py-2">
                  <p className="font-heading text-xs font-bold text-emerald-200">{countyRow.county}</p>
                  <p className="font-body text-[10px] text-emerald-100/90">
                    Tier {countyRow.tier ?? "—"} · score {countyRow.priorityScore ?? "—"} · Touches since Nov 1:{" "}
                    {countyRow.pastTouchesSinceNov1 ?? "—"} · Next: {countyRow.nextScheduledAnchor ?? "—"}
                  </p>
                </div>
                {winSelected ? (
                  <div className="rounded-lg border border-sky-500/35 bg-sky-950/30 px-3 py-2 font-body text-[10px] text-zinc-200">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-sky-300">County brief · win target</p>
                    <ul className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed text-zinc-300">
                      <li>Baseline vote est. {winSelected.baselineDemVotes.toLocaleString()} ({(winSelected.baselineDemShare * 100).toFixed(1)}%)</li>
                      <li>Target votes {winSelected.targetVotes.toLocaleString()} · Target gain {winSelected.targetVoteGain.toLocaleString()}</li>
                      <li>Registration goal {winSelected.registrationGoal?.toLocaleString() ?? "—"}</li>
                      <li>Turnout headroom {winSelected.turnoutHeadroom?.toLocaleString() ?? "—"}</li>
                      <li>Confidence {winSelected.confidence} · Label {winSelected.dashboardLabel.replace(/_/g, " ")}</li>
                      <li>Next route opportunity: use week map + opportunities board (human commit).</li>
                    </ul>
                    {winSelected.missingData.length ? (
                      <p className="mt-2 text-amber-200/90">Needs data: {winSelected.missingData.slice(0, 6).join(", ")}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-body text-[10px] text-zinc-500">No win-target row for this county yet — run election scenario build.</p>
                )}
                {capSelected ? (
                  <div className="rounded-lg border border-violet-500/35 bg-violet-950/30 px-3 py-2 font-body text-[10px] text-zinc-200">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">Volunteer capacity · coverage</p>
                    <ul className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed text-zinc-300">
                      <li>
                        Event staffing need {capSelected.eventStaffingNeed} · House-party host need {capSelected.housePartyHostNeed} · Local guide gap{" "}
                        {capSelected.localGuideNeed}
                      </li>
                      <li>
                        Follow-up volunteer need {capSelected.followUpVolunteerNeed} · Reg. education touches {capSelected.voterRegistrationEducationNeed}{" "}
                        · Phone hours {capSelected.phoneBankCapacityNeedHours}
                      </li>
                      <li>
                        Access / language: {capSelected.hispanicCommunityAccessNeed.replace(/_/g, " ")}
                        {capSelected.languageAccessNotes ? ` — ${capSelected.languageAccessNotes.slice(0, 120)}` : ""}
                      </li>
                      <li>
                        Fundraising support envelope {capSelected.realisticCountyFundraisingGoal?.toLocaleString() ?? "—"} (
                        {capSelected.fundraisingConfidence}) · House-party potential {capSelected.housePartyFundraisingPotential}
                      </li>
                      <li>Confidence {capSelected.confidence}</li>
                    </ul>
                    {capSelected.staffNextActions.length ? (
                      <p className="mt-2 text-emerald-200/90">Staff next: {capSelected.staffNextActions.slice(0, 3).join(" · ")}</p>
                    ) : null}
                    {capSelected.missingData.length ? (
                      <p className="mt-2 text-amber-200/90">Ops data gaps: {capSelected.missingData.slice(0, 5).join(", ")}</p>
                    ) : null}
                  </div>
                ) : volunteerCapacityModel ? (
                  <p className="font-body text-[10px] text-zinc-500">No volunteer-capacity row for this county.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-8">
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
                  {(() => {
                    const cov = coverageByItemId.get(it.id) ?? (it.sourceId ? coverageByItemId.get(it.sourceId) : undefined);
                    if (!cov) return null;
                    const staffingGap = cov.volunteersNeeded;
                    return (
                      <p className="mt-0.5 font-body text-[10px] text-violet-800">
                        Coverage: {cov.status === "ready" || cov.status === "covered" ? "ready" : cov.volunteerLeadNeeded ? "needs volunteer lead" : cov.status.replace(/_/g, " ")}
                        {" · "}
                        {cov.coverageMode === "local_volunteer_coverage" || cov.coverageMode === "county_party_surrogate" ? "needs local coverage · " : ""}
                        {cov.tableNeeded ? "table permission needed · " : ""}
                        {(cov.materials.pushCards > 0 || cov.materials.fans > 0 || cov.materials.brandedMints > 0) ? "materials needed · " : ""}
                        staffing gap {staffingGap}
                      </p>
                    );
                  })()}
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
