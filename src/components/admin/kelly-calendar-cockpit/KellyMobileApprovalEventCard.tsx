"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  approveCalendarItem,
  askStaffAboutCalendarItem,
  holdCalendarItem,
  rejectCalendarItem,
  requestCalendarItemModification,
  requestLocalCoverage,
  saveKellyCalendarItemStaging,
} from "@/app/admin/calendar-command-center/cockpit-actions";
import type { AiRecommendationApiItem } from "@/lib/calendar/ai-approval-recommendation-types";
import type { WorkScheduleSummary } from "@/lib/calendar/build-approval-context";
import type { CountyBasicsStrip } from "@/lib/calendar/kelly-county-basics";
import type {
  GoogleSyncStatusPref,
  GoogleSyncTargetPref,
  KellyItemStagedMetadata,
  PressReleasePref,
} from "@/lib/calendar/kelly-cockpit-staged-metadata";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";
import type { KellySurrogateTypePref } from "@prisma/client";
import { KellyCountyContextSheet } from "@/components/admin/kelly-calendar-cockpit/KellyCountyContextSheet";

const TZ = "America/Chicago";

const OFFSITE = { target: "_blank" as const, rel: "noopener noreferrer" };
const pillLink =
  "inline-flex items-center justify-center rounded-lg border border-zinc-300/90 bg-white px-2 py-2 text-center font-body text-[9px] font-bold uppercase leading-tight tracking-wide text-zinc-800 shadow-sm active:bg-zinc-100";

const WORK_PRETTY: Record<WorkScheduleSummary, string> = {
  during_work_hours: "During work hours",
  requires_work_exception: "Requires work exception",
  can_be_done_after_work: "Can be done after work",
  night_before_travel_recommended: "Night-before travel recommended",
  no_issue: "No issue",
};

const GOOGLE_STATUS: Record<GoogleSyncStatusPref, string> = {
  not_synced: "Not synced",
  ready_to_sync: "Ready to sync",
  synced_to_google: "Synced to Google",
  google_conflict: "Google conflict",
  needs_staff_before_sync: "Needs staff before sync",
};

const GOOGLE_TARGET: Record<GoogleSyncTargetPref, string> = {
  kelly_public: "Kelly public calendar",
  kelly_private: "Kelly private calendar",
  staff: "Staff calendar",
  travel: "Travel calendar",
};

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

function mapSurrogate(t: string): KellySurrogateTypePref {
  const m: Record<string, KellySurrogateTypePref> = {
    county_chair: "COUNTY_CHAIR",
    county_party_contact: "COUNTY_PARTY_CONTACT",
    trusted_local: "TRUSTED_LOCAL",
    volunteer: "VOLUNTEER",
    local_elected: "LOCAL_ELECTED",
    staff_choose: "STAFF_CHOOSE",
  };
  return m[t] ?? "STAFF_CHOOSE";
}

type Props = {
  it: EnrichedCalendarItem;
  ai?: AiRecommendationApiItem;
  aiLoading?: boolean;
  countyBasics: CountyBasicsStrip;
  staged: KellyItemStagedMetadata;
};

export function KellyMobileApprovalEventCard({ it, ai, aiLoading, countyBasics, staged }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saving, startSave] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const rec = ai?.recommendation;
  const ctx = ai?.context;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [press, setPress] = useState<PressReleasePref>(staged.pressRelease ?? "staff_decide");
  const [pressNote, setPressNote] = useState(staged.pressAngleNote ?? "");
  const [gStat, setGStat] = useState<GoogleSyncStatusPref>(staged.googleSyncStatus ?? "not_synced");
  const [gTarget, setGTarget] = useState<GoogleSyncTargetPref>(staged.googleSyncTarget ?? "travel");

  useEffect(() => {
    setPress(staged.pressRelease ?? "staff_decide");
    setPressNote(staged.pressAngleNote ?? "");
    setGStat(staged.googleSyncStatus ?? "not_synced");
    setGTarget(staged.googleSyncTarget ?? "travel");
  }, [staged.pressRelease, staged.pressAngleNote, staged.googleSyncStatus, staged.googleSyncTarget, staged.updatedAt]);

  const countyLabel = useMemo(() => [it.county, it.city].filter(Boolean).join(" · ") || "County", [it.county, it.city]);

  const fmtWhen = useMemo(
    () =>
      new Date(it.start).toLocaleString("en-US", {
        timeZone: TZ,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [it.start],
  );

  const run = useCallback(
    (fn: () => Promise<unknown>) => {
      setMsg(null);
      start(async () => {
        try {
          await fn();
          router.refresh();
        } catch (e) {
          setMsg(e instanceof Error ? e.message : "Action failed");
        }
      });
    },
    [router],
  );

  const saveStaging = useCallback(() => {
    setMsg(null);
    startSave(async () => {
      try {
        await saveKellyCalendarItemStaging(it.id, {
          pressRelease: press,
          pressAngleNote: pressNote || null,
          googleSyncStatus: gStat,
          googleSyncTarget: gTarget,
        });
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Save failed");
      }
    });
  }, [gStat, gTarget, it.id, press, pressNote, router]);

  const modNotes = rec?.suggestedModifications?.length
    ? rec.suggestedModifications.map((m) => `${m.field}: ${m.suggestion}`).join("\n")
    : rec?.headline ?? "Kelly mobile — requested changes";

  const staffMsg = rec?.headline ? `AI summary: ${rec.headline}\n${rec.why.slice(0, 3).join(" ")}` : "Kelly mobile — needs staff input";

  const who = ctx?.whoSummary ?? (it.drillDown?.host ? `Host: ${it.drillDown.host}` : undefined);
  const phone = it.drillDown?.adminLocalGuide?.phone;
  const workChip = ctx ? WORK_PRETTY[ctx.workScheduleSummary] : "—";
  const lunchChip = ctx ? (ctx.lunchWindowLabel === "lunch_slot_available" ? "Lunch slot available" : "No lunch window") : "—";

  return (
    <article className="relative mb-6 overflow-x-hidden rounded-2xl border border-zinc-200/80 bg-[#fdfbf7] shadow-[0_12px_40px_-18px_rgba(0,0,0,0.25)]">
      <div className="space-y-4 px-5 pb-[22rem] pt-5 sm:pb-80">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className={`inline-flex rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide ${cardBadgeClass(it.cardBadge)}`}>
              {badgeLabel(it.cardBadge)}
            </span>
            <Link href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`} className="mt-2 block">
              <h2 className="font-heading text-xl font-bold leading-snug tracking-tight text-zinc-900 underline-offset-4 hover:underline">{it.title}</h2>
            </Link>
            <p className="mt-2 font-body text-sm font-medium text-zinc-600">{fmtWhen}</p>
            <p className="mt-1 font-body text-sm text-zinc-500">
              {countyLabel}
              {it.location ? ` · ${it.location}` : ""}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" onClick={() => setSheetOpen(true)} className={pillLink}>
            County brief
          </button>
          <Link href="/admin/counties" className={pillLink} {...OFFSITE}>
            County dashboard
          </Link>
          <Link href="/admin/county-intelligence" className={pillLink} {...OFFSITE}>
            Voter snapshot
          </Link>
          <Link href="/admin/calendar-command-center" className={pillLink} {...OFFSITE}>
            Past touches
          </Link>
          <Link href="/admin/workbench/calendar" className={pillLink} {...OFFSITE}>
            Nearby ops
          </Link>
          <Link href="/admin/calendar-command-center" className={pillLink} {...OFFSITE}>
            Full dashboard
          </Link>
        </div>

        {(who || it.drillDown?.adminLocalGuide?.displayName) ? (
          <section>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Who</p>
            {who ? <p className="mt-1 font-body text-sm leading-relaxed text-zinc-800">{who}</p> : null}
            {it.drillDown?.adminLocalGuide?.displayName ? (
              <p className="mt-2 font-body text-xs text-zinc-600">
                Local guide: <span className="font-semibold text-zinc-800">{it.drillDown.adminLocalGuide.displayName}</span>
                {phone ? (
                  <>
                    {" "}
                    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="font-bold text-emerald-800 underline-offset-2 hover:underline">
                      Tap to call (admin)
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
          </section>
        ) : null}

        <section>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Why this matters</p>
          <p className="mt-1 font-body text-sm leading-relaxed text-zinc-800">{ctx?.whyThisMatters ?? it.notes?.slice(0, 360) ?? "County priority + travel context — staff confirm."}</p>
        </section>

        {aiLoading ? <p className="font-body text-xs text-zinc-500">Preparing briefing…</p> : null}

        {rec ? (
          <section className="rounded-xl border border-zinc-200/90 bg-white/80 px-4 py-3">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800/80">Recommendation</p>
            <p className="mt-1 font-heading text-lg font-bold leading-snug text-zinc-900">{rec.headline}</p>
            <ul className="mt-3 space-y-1.5 font-body text-sm text-zinc-700">
              {rec.why.slice(0, 4).map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500/80" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {ctx ? (
          <section className="space-y-2 rounded-xl border border-zinc-200/80 bg-white/60 px-4 py-3 font-body text-xs text-zinc-700">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-800">{workChip}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-800">{lunchChip}</span>
              {ctx.tuesdayLittleRockConflict ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-950">Tuesday LR rule</span>
              ) : null}
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-600">{ctx.workScheduleDetail}</p>
            {ctx.estimatedDistanceMiles != null ? (
              <p className="text-sm text-zinc-800">
                <span className="font-semibold">Travel:</span> ~{ctx.estimatedDistanceMiles} mi (~{ctx.estimatedDriveMinutes ?? "?"} min @ 55 mph heuristic) from {ctx.travelOriginLabel}
                {ctx.estimatedDistanceMilesFromRoseBud != null ? ` · ${ctx.estimatedDistanceMilesFromRoseBud} mi from Rose Bud ref` : null}
                <span className="text-zinc-500"> · {ctx.distanceConfidence}</span>
              </p>
            ) : null}
            {ctx.conflicts.length ? (
              <p className="text-sm font-semibold text-rose-800">Conflicts: {ctx.conflicts.length} same-day overlap(s)</p>
            ) : null}
            {ctx.countyClerkSuggestion ? <p className="text-sm text-emerald-900/90">{ctx.countyClerkSuggestion}</p> : null}
            {ctx.courthousePhotoSuggestion ? <p className="text-sm text-emerald-900/80">{ctx.courthousePhotoSuggestion}</p> : null}
            {ctx.localCivicStopSuggestion ? <p className="text-sm text-sky-900/80">{ctx.localCivicStopSuggestion}</p> : null}
            {ctx.overnightRecommended ? <p className="text-sm text-amber-900/90">Overnight: {ctx.overnightReason ?? "Flagged."}</p> : null}
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 border-t border-zinc-200/90 bg-[#fdfbf7]/95 px-4 py-3 backdrop-blur-md">
        {rec ? (
          <p className="mb-3 text-center font-heading text-sm font-bold text-zinc-900">
            Suggested: <span className="text-emerald-800">{rec.recommendation.replace(/_/g, " ")}</span>
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-emerald-800 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-sm disabled:opacity-50"
            onClick={() => run(() => approveCalendarItem(it.id, rec?.headline))}
          >
            Approve
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-amber-400 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-zinc-900 shadow-sm disabled:opacity-50"
            onClick={() => run(() => requestCalendarItemModification({ calendarItemId: it.id, notes: modNotes }))}
          >
            Modify
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-violet-700 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-sm disabled:opacity-50"
            onClick={() =>
              run(() =>
                requestLocalCoverage({
                  calendarItemId: it.id,
                  surrogateType: mapSurrogate(rec?.localAsk?.suggestedSurrogateType ?? "staff_choose"),
                  notes: rec?.localAsk?.reason ?? rec?.headline,
                }),
              )
            }
          >
            Send local
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-zinc-500 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-sm disabled:opacity-50"
            onClick={() => run(() => holdCalendarItem(it.id, "work_conflict", rec?.headline))}
          >
            Hold
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-rose-700 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-sm disabled:opacity-50"
            onClick={() => run(() => rejectCalendarItem(it.id, rec?.headline ? `Reject: ${rec.headline}` : "Kelly mobile reject"))}
          >
            Reject
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-xl bg-sky-700 py-3 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-sm disabled:opacity-50"
            onClick={() => run(() => askStaffAboutCalendarItem(it.id, staffMsg.slice(0, 7900)))}
          >
            Ask staff
          </button>
        </div>

        <div className="mt-4 space-y-3 border-t border-zinc-200/80 pt-3">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Press release</p>
          <div className="flex flex-wrap gap-1.5">
            {(["no", "maybe", "yes", "staff_decide"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPress(v)}
                className={`rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase ${
                  press === v ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {v === "staff_decide" ? "Staff decide" : v}
              </button>
            ))}
          </div>
          <textarea
            value={pressNote}
            onChange={(e) => setPressNote(e.target.value)}
            placeholder="Press angle / quote / local hook"
            rows={2}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-body text-xs text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        <div className="mt-4 space-y-2 border-t border-zinc-200/80 pt-3">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Google Calendar (staging)</p>
          <p className="font-body text-[10px] text-zinc-500">Does not auto-write. Use Calendar HQ when explicitly safe.</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(GOOGLE_STATUS) as GoogleSyncStatusPref[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setGStat(v)}
                className={`rounded-full px-2 py-1 font-body text-[9px] font-bold uppercase ${
                  gStat === v ? "bg-sky-900 text-white" : "bg-sky-100 text-sky-900"
                }`}
              >
                {GOOGLE_STATUS[v]}
              </button>
            ))}
          </div>
          <select
            value={gTarget}
            onChange={(e) => setGTarget(e.target.value as GoogleSyncTargetPref)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 font-body text-xs text-zinc-800"
          >
            {(Object.keys(GOOGLE_TARGET) as GoogleSyncTargetPref[]).map((k) => (
              <option key={k} value={k}>
                {GOOGLE_TARGET[k]}
              </option>
            ))}
          </select>
          <Link
            href="/admin/workbench/calendar"
            className="block text-center font-body text-[11px] font-semibold text-sky-800 underline-offset-2 hover:underline"
          >
            Open Calendar HQ →
          </Link>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={saveStaging}
          className="mt-4 w-full rounded-xl border border-zinc-300 bg-white py-2.5 font-body text-xs font-bold uppercase tracking-wide text-zinc-800 shadow-sm disabled:opacity-50"
        >
          Save briefing
        </button>
        {msg ? <p className="mt-2 text-center font-body text-xs text-rose-700">{msg}</p> : null}
      </div>

      <KellyCountyContextSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        countyLabel={countyLabel}
        countyBasics={countyBasics}
        eventId={it.id}
      />
    </article>
  );
}
