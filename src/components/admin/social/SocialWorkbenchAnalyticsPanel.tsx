"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { CampaignTaskType, SocialMessageToneMode, SocialStrategicFollowupType } from "@prisma/client";
import {
  applyHeuristicStrategicRecommendationsAction,
  createClarificationPostFromAnalytics,
  createCountyVariantFromAnalytics,
  createFollowupSocialItemFromAnalytics,
  createSocialPerformanceSnapshotAction,
  createVolunteerCtaFromAnalytics,
  getSocialAnalyticsTimingIntelligenceAction,
  upsertSocialStrategicInsightAction,
} from "@/app/admin/workbench-social-actions";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import { computeMeaningfulEngagementDetail } from "@/lib/social/engagement-score";
import type { SocialAnalyticsAggregates, SocialAnalyticsTimingIntelligence } from "@/lib/social/social-analytics-aggregates";
import type { SocialContentWorkbenchDetail, SocialPerformanceSnapshotDto } from "@/lib/social/social-workbench-dto";
import { toDatetimeLocalInputValue, parseDatetimeLocalToUtc } from "@/lib/social/date-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  NativeSelect,
  UiBadge,
  UiButton,
  UiInput,
  UiTextarea,
} from "./social-ui-primitives";
import { cn } from "@/lib/utils";

function pct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

function ratePart(num: number | null | undefined, den: number | null | undefined): string {
  if (num == null || den == null || den <= 0) return "—";
  return pct(num / den, 2);
}

function pickPrimarySnapshot(snapshots: SocialPerformanceSnapshotDto[]): SocialPerformanceSnapshotDto | null {
  if (!snapshots.length) return null;
  const rollup = snapshots.find((s) => !s.socialPlatformVariantId);
  return rollup ?? snapshots[0] ?? null;
}

const CONVERSION_TASK_TYPES: CampaignTaskType[] = [
  CampaignTaskType.VOLUNTEER,
  CampaignTaskType.COMMS,
  CampaignTaskType.FOLLOW_UP,
];

type InsightField = "timingInsight" | "tonePerformance" | "retentionSignal" | "conversionSignal";

const INSIGHT_LABELS: Record<InsightField, { title: string; hint: string }> = {
  timingInsight: {
    title: "Timing",
    hint: "When replies and quality engagement cluster (local time, daypart). Drives reposting windows and quiet reply blocks.",
  },
  tonePerformance: {
    title: "Tone & trust",
    hint: "Which voice earned curiosity vs. friction — for trust-first messaging, not “viral” spikes.",
  },
  retentionSignal: {
    title: "Message retention",
    hint: "Saves, re-watches, thread depth, shares with comment — people staying with the message.",
  },
  conversionSignal: {
    title: "Conversion",
    hint: "RSVPs, signups, volunteer DMs, or event narrative tied to this work item (see tasks + event below).",
  },
};

function SentimentChips({ breakdown }: { breakdown: Record<string, number> | null | undefined }) {
  if (!breakdown || !Object.keys(breakdown).length) {
    return <p className="text-xs text-slate-500">No thread classification yet. Import or add estimates; AI classify — coming.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(breakdown)
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => (
          <UiBadge key={k} className="border-amber-200 bg-amber-50 text-amber-900">
            {socialEnumLabel(k)} · {n}
          </UiBadge>
        ))}
    </div>
  );
}

const TONE_MODE_OPTIONS = [
  { value: "", label: "—" },
  ...Object.values(SocialMessageToneMode).map((m) => ({ value: m, label: socialEnumLabel(m) })),
];
const FOLLOWUP_OPTIONS = Object.values(SocialStrategicFollowupType).map((f) => ({ value: f, label: socialEnumLabel(f) }));

function StrategicInsightForm({
  detail,
  onSaved,
}: {
  detail: SocialContentWorkbenchDetail;
  onSaved: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const s = detail.strategicInsight;
  const [timingInsight, setTimingInsight] = useState(s?.timingInsight ?? "");
  const [tonePerformance, setTonePerformance] = useState(s?.tonePerformance ?? "");
  const [retentionSignal, setRetentionSignal] = useState(s?.retentionSignal ?? "");
  const [conversionSignal, setConversionSignal] = useState(s?.conversionSignal ?? "");
  const [recommendedNextTone, setRecommendedNextTone] = useState(s?.recommendedNextTone ?? "");
  const [recommendedBestWindow, setRecommendedBestWindow] = useState(s?.recommendedBestWindow ?? "");
  const [recommendedFollowupType, setRecommendedFollowupType] = useState(s?.recommendedFollowupType ?? "NONE");
  const [recommendedCountyFocus, setRecommendedCountyFocus] = useState(s?.recommendedCountyFocus ?? "");
  const [recommendedCtaType, setRecommendedCtaType] = useState(s?.recommendedCtaType ?? "");
  const [confidenceScore, setConfidenceScore] = useState(s?.confidenceScore != null ? String(s.confidenceScore) : "");

  useEffect(() => {
    setTimingInsight(s?.timingInsight ?? "");
    setTonePerformance(s?.tonePerformance ?? "");
    setRetentionSignal(s?.retentionSignal ?? "");
    setConversionSignal(s?.conversionSignal ?? "");
    setRecommendedNextTone(s?.recommendedNextTone ?? "");
    setRecommendedBestWindow(s?.recommendedBestWindow ?? "");
    setRecommendedFollowupType(s?.recommendedFollowupType ?? "NONE");
    setRecommendedCountyFocus(s?.recommendedCountyFocus ?? "");
    setRecommendedCtaType(s?.recommendedCtaType ?? "");
    setConfidenceScore(s?.confidenceScore != null ? String(s.confidenceScore) : "");
  }, [detail.id, s?.updatedAt, s, detail.strategicInsight]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData();
        fd.set("socialContentItemId", detail.id);
        fd.set("timingInsight", timingInsight);
        fd.set("tonePerformance", tonePerformance);
        fd.set("retentionSignal", retentionSignal);
        fd.set("conversionSignal", conversionSignal);
        if (recommendedNextTone) fd.set("recommendedNextTone", recommendedNextTone);
        else fd.set("recommendedNextTone", "");
        fd.set("recommendedBestWindow", recommendedBestWindow);
        fd.set("recommendedFollowupType", recommendedFollowupType);
        fd.set("recommendedCountyFocus", recommendedCountyFocus);
        fd.set("recommendedCtaType", recommendedCtaType);
        fd.set("confidenceScore", confidenceScore);
        start(async () => {
          const r = await upsertSocialStrategicInsightAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          onSaved();
        });
      }}
    >
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(INSIGHT_LABELS) as InsightField[]).map((key) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-3">
            <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">{INSIGHT_LABELS[key].title}</label>
            <p className="mb-2 text-[10px] text-slate-500">{INSIGHT_LABELS[key].hint}</p>
            <UiTextarea
              className="min-h-[88px] rounded-xl text-sm"
              value={
                key === "timingInsight"
                  ? timingInsight
                  : key === "tonePerformance"
                    ? tonePerformance
                    : key === "retentionSignal"
                      ? retentionSignal
                      : conversionSignal
              }
              onChange={(e) => {
                const v = e.target.value;
                if (key === "timingInsight") setTimingInsight(v);
                else if (key === "tonePerformance") setTonePerformance(v);
                else if (key === "retentionSignal") setRetentionSignal(v);
                else setConversionSignal(v);
              }}
              maxLength={20000}
              placeholder="Short, decision-ready notes for the campaign team…"
            />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Structured recommendations (ops + learning)</h4>
        <p className="mb-3 text-[10px] text-slate-600">
          Campaign-safe next steps. Use &quot;Apply heuristics&quot; above the fold to pre-fill from recent data, then edit. Confidence is 0–1.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">Next tone</span>
            <NativeSelect
              className="mt-1 rounded-xl"
              value={recommendedNextTone}
              onValueChange={(v) => setRecommendedNextTone(v)}
              options={TONE_MODE_OPTIONS}
              aria-label="Recommended next tone"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">Follow-up type</span>
            <NativeSelect
              className="mt-1 rounded-xl"
              value={recommendedFollowupType}
              onValueChange={(v) => setRecommendedFollowupType(v as SocialStrategicFollowupType)}
              options={FOLLOWUP_OPTIONS}
              aria-label="Recommended follow-up type"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Best window (human-readable)</span>
            <UiInput
              className="mt-1 rounded-xl"
              value={recommendedBestWindow}
              onChange={(e) => setRecommendedBestWindow(e.target.value)}
              placeholder="e.g. Tue/Thu 18:00–20:00 local"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">County / region focus</span>
            <UiInput
              className="mt-1 rounded-xl"
              value={recommendedCountyFocus}
              onChange={(e) => setRecommendedCountyFocus(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">CTA type</span>
            <UiInput
              className="mt-1 rounded-xl"
              value={recommendedCtaType}
              onChange={(e) => setRecommendedCtaType(e.target.value)}
              placeholder="e.g. reply, rsvp, link_in_bio"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">Confidence (0–1)</span>
            <UiInput
              className="mt-1 rounded-xl"
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(e.target.value)}
              inputMode="decimal"
              placeholder="0.4"
            />
          </div>
        </div>
      </div>
      <UiButton type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Saving…" : "Save strategic notes"}
      </UiButton>
    </form>
  );
}

function ManualSnapshotForm({
  detail,
  onSaved,
  variantOptions,
}: {
  detail: SocialContentWorkbenchDetail;
  onSaved: () => void;
  variantOptions: { id: string; label: string }[];
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => toDatetimeLocalInputValue(new Date(Date.now() - 86400000 * 2).toISOString()));
  const [periodEnd, setPeriodEnd] = useState(() => toDatetimeLocalInputValue(new Date().toISOString()));
  const [variant, setVariant] = useState("");
  const [useWorkItemEvent, setUseWorkItemEvent] = useState(!!detail.campaignEventId);

  return (
    <Card className="rounded-3xl border-dashed border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Log performance period</CardTitle>
        <CardDescription>
          Manual or CSV import (later). Use one row per reporting window; optional per-variant slice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UiButton type="button" variant="outline" className="mb-3 rounded-xl" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide form" : "Add manual snapshot"}
        </UiButton>
        {open ? (
          <form
            className="grid max-w-2xl gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setErr(null);
              const el = e.currentTarget;
              const fd = new FormData(el);
              fd.set("socialContentItemId", detail.id);
              if (variant) fd.set("socialPlatformVariantId", variant);
              else fd.delete("socialPlatformVariantId");
              if (useWorkItemEvent && detail.campaignEventId) fd.set("useWorkItemEvent", "1");
              start(async () => {
                const r = await createSocialPerformanceSnapshotAction(fd);
                if (!r.ok) {
                  setErr(r.error);
                  return;
                }
                onSaved();
                setOpen(false);
              });
            }}
          >
            {err ? <p className="text-xs text-red-600">{err}</p> : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Period start (local)</label>
                <input
                  name="periodStart"
                  type="datetime-local"
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Period end (local)</label>
                <input
                  name="periodEnd"
                  type="datetime-local"
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  required
                />
              </div>
            </div>
            {variantOptions.length > 0 ? (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Variant (optional)</label>
                <select
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  <option value="">All channels (rollup)</option>
                  {variantOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  "impressions",
                  "likes",
                  "comments",
                  "shares",
                  "saves",
                  "clickThroughs",
                ] as const
              ).map((name) => (
                <div key={name}>
                  <label className="text-[10px] font-bold uppercase text-slate-500">{socialEnumLabel(name)}</label>
                  <input
                    name={name}
                    type="number"
                    min={0}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">CTR (0–1)</label>
                <input
                  name="clickThroughRate"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.04"
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Video complete (0–1)</label>
                <input
                  name="videoCompletionRate"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.35"
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Quality score (0–100)</label>
                <input
                  name="engagementQualityScore"
                  type="text"
                  inputMode="decimal"
                  placeholder="Leave blank for weighted auto-score"
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                />
                <p className="mt-0.5 text-[9px] text-slate-500">When empty, uses saves, shares, comments, CTR, VCR, leads — not raw likes.</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Volunteer / interest signals</label>
                <input
                  name="volunteerLeadCount"
                  type="number"
                  min={0}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                />
              </div>
              {detail.campaignEventId ? (
                <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={useWorkItemEvent}
                    onChange={(e) => setUseWorkItemEvent(e.target.checked)}
                  />
                  Attribute conversion to linked campaign event
                </label>
              ) : null}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Notes (source, caveats)</label>
              <textarea
                name="notes"
                rows={2}
                className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
                placeholder="e.g. API_IMPORT partial day; hostile spike filtered"
              />
            </div>
            <UiButton type="submit" className="rounded-xl" disabled={pending}>
              {pending ? "Saving…" : "Save snapshot"}
            </UiButton>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function confidenceLabel(snapshotCount: number): string {
  if (snapshotCount < 5) return "Directional (low n)";
  if (snapshotCount < 20) return "Moderate";
  return "Stronger";
}

function toneTrustLines(agg: SocialAnalyticsAggregates, primary: SocialPerformanceSnapshotDto | null): string[] {
  const lines: string[] = [];
  const top = agg.byTone[0];
  if (top && top.n >= 2) {
    lines.push(
      `Trust-weighted engagement leans toward ${socialEnumLabel(top.tone)} (avg score ${top.avgScore.toFixed(1)}, n=${top.n}) — good candidate for the next post if it matches the moment.`
    );
  } else {
    lines.push("Label more work items with message tone so we can rank non-negative voice modes with confidence.");
  }
  if (agg.byTactic.length > 0) {
    const tt = agg.byTactic[0]!;
    lines.push(
      `Top framing: ${socialEnumLabel(tt.tactic)} (n=${tt.n}) — story vs explainer vs clarify drives different learning.`
    );
  }
  const br = primary?.sentimentBreakdown;
  if (br && primary) {
    const tot = Object.values(br).reduce((a, b) => a + b, 0);
    if (tot > 0) {
      const confused = (br["CONFUSED"] ?? 0) / tot;
      const hostile = (br["HOSTILE"] ?? 0) / tot;
      if (confused + hostile > 0.2) {
        lines.push(
          "Thread mix shows confusion or heat — favor CALM_CLARIFICATION and ISSUE_EDUCATION; avoid piling on or stoking outrage."
        );
      }
    }
  }
  const last = agg.byTone.length > 1 ? agg.byTone[agg.byTone.length - 1] : null;
  if (last && last.n >= 2 && top && last.tone !== top.tone) {
    lines.push(
      `${socialEnumLabel(last.tone)} is lower in this window (n=${last.n}) — not “bad,” but consider pairing with a warmer or clearer follow-up.`
    );
  }
  return lines;
}

function AnalyticsPatternsSection({
  agg,
  windowLabel,
  confidenceHint,
}: {
  agg: SocialAnalyticsAggregates | null;
  windowLabel: string;
  confidenceHint: string | null;
}) {
  if (!agg || (agg.snapshotCount === 0 && agg.byKind.length === 0 && agg.byTone.length === 0)) {
    return (
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Best posting windows</CardTitle>
          <CardDescription>
            {confidenceHint ?? `Needs snapshot rows with post times (UTC). ${windowLabel}.`}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const topPlatHours = Object.entries(agg.bestHourByPlatform)
    .sort((a, b) => b[1]!.avgScore - a[1]!.avgScore)
    .slice(0, 4);
  const topPlatDays = Object.entries(agg.bestWeekdayByPlatform)
    .sort((a, b) => b[1]!.avgScore - a[1]!.avgScore)
    .slice(0, 4);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Best posting windows (UTC · by platform)</CardTitle>
          <CardDescription>
            {windowLabel} · {agg.snapshotCount} snapshots · {confidenceLabel(agg.snapshotCount)} confidence.{" "}
            {confidenceHint ? `— ${confidenceHint}` : "Hour = UTC; compare to local post time in ops notes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {topPlatHours.length === 0 ? (
            <p className="text-slate-500">Add per-variant publish/schedule times to snapshots.</p>
          ) : (
            <ul className="space-y-1.5">
              {topPlatHours.map(([pl, w]) => (
                <li key={pl} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                  <span className="font-medium text-slate-800">{socialEnumLabel(pl)}</span>
                  <span className="text-right text-slate-600">
                    {w!.label} · score {w!.avgScore.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Best weekday (UTC · by platform)</CardTitle>
          <CardDescription>Where trust-weighted engagement clusters on the calendar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {topPlatDays.length === 0 ? (
            <p className="text-slate-500">—</p>
          ) : (
            <ul className="space-y-1.5">
              {topPlatDays.map(([pl, w]) => (
                <li key={pl} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                  <span className="font-medium text-slate-800">{socialEnumLabel(pl)}</span>
                  <span className="text-right text-slate-600">
                    {w!.label} · score {w!.avgScore.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-slate-200 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Best windows by content kind</CardTitle>
          <CardDescription>Weighted score by `SocialContentKind` — not raw reach.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">By kind</p>
            <ul className="text-sm">
              {agg.byKind.map((r) => (
                <li key={r.kind} className="flex justify-between py-0.5">
                  <span>{socialEnumLabel(r.kind)}</span>
                  <span className="tabular-nums text-slate-700">
                    {r.avgScore.toFixed(1)} <span className="text-slate-400">(n={r.n})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">By tone (voice)</p>
            {agg.byTone.length === 0 ? (
              <p className="text-xs text-slate-500">Set message tone on work items.</p>
            ) : (
              <ul className="text-sm">
                {agg.byTone.map((r) => (
                  <li key={r.tone} className="flex justify-between py-0.5">
                    <span>{socialEnumLabel(r.tone)}</span>
                    <span className="tabular-nums text-slate-700">
                      {r.avgScore.toFixed(1)} <span className="text-slate-400">(n={r.n})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">By framing (tactic)</p>
            {agg.byTactic.length === 0 ? (
              <p className="text-xs text-slate-500">Set message framing on work items (story vs explainer, etc.).</p>
            ) : (
              <ul className="text-sm">
                {agg.byTactic.map((r) => (
                  <li key={r.tactic} className="flex justify-between py-0.5">
                    <span>{socialEnumLabel(r.tactic)}</span>
                    <span className="tabular-nums text-slate-700">
                      {r.avgScore.toFixed(1)} <span className="text-slate-400">(n={r.n})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="md:col-span-3 border-t border-slate-100 pt-3">
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Event-linked vs not</p>
            <p className="text-sm text-slate-700">
              With event: avg {agg.eventSplit.withEvent.avgScore.toFixed(1)} (n={agg.eventSplit.withEvent.n}) · Without:{" "}
              {agg.eventSplit.withoutEvent.avgScore.toFixed(1)} (n={agg.eventSplit.withoutEvent.n})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AiHookCard({
  title,
  body,
  stub,
}: {
  title: string;
  body: string;
  stub: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-1 text-sm font-semibold text-slate-900">{title}</div>
      <p className="text-xs text-slate-600">{body}</p>
      {stub ? (
        <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-white p-2 text-[10px] text-slate-600">{stub}</pre>
      ) : (
        <p className="mt-2 text-[10px] italic text-slate-500">No AI output yet — placeholder integration.</p>
      )}
      <UiButton type="button" className="mt-3 rounded-xl" size="sm" disabled title="Wire to `social-analytics-ai-stubs` then your provider">
        Run (coming soon)
      </UiButton>
    </div>
  );
}

export function SocialWorkbenchAnalyticsPanel({
  detail,
  onRefresh,
}: {
  detail: SocialContentWorkbenchDetail;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [timing, setTiming] = useState<SocialAnalyticsTimingIntelligence | null>(null);
  const [winIdx, setWinIdx] = useState(1);
  const [aggErr, setAggErr] = useState<string | null>(null);
  const [heuristicPending, startHeuristic] = useTransition();
  const [followPending, startFollow] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setAggErr(null);
    getSocialAnalyticsTimingIntelligenceAction().then((r) => {
      if (cancelled) return;
      if (r.ok) setTiming(r.data);
      else setAggErr(r.error);
    });
    return () => {
      cancelled = true;
    };
  }, [detail.id]);

  const windowEntry = timing?.windows[winIdx] ?? timing?.windows[1] ?? timing?.windows[0];
  const agg = windowEntry?.aggregates ?? null;
  const windowLabel = windowEntry?.label ?? "Last 30 days";
  const windowConfidence = windowEntry?.confidenceHint ?? null;

  const primary = useMemo(() => pickPrimarySnapshot(detail.performanceSnapshots), [detail.performanceSnapshots]);
  const primaryEngagement = useMemo(() => {
    if (!primary) return null;
    return computeMeaningfulEngagementDetail({
      impressions: primary.impressions,
      likes: primary.likes,
      comments: primary.comments,
      shares: primary.shares,
      saves: primary.saves,
      clickThroughs: primary.clickThroughs,
      clickThroughRate: primary.clickThroughRate,
      videoCompletionRate: primary.videoCompletionRate,
      volunteerLeadCount: primary.volunteerLeadCount,
    });
  }, [primary]);
  const conversionTasks = useMemo(
    () => detail.tasks.filter((t) => CONVERSION_TASK_TYPES.includes(t.taskType)),
    [detail.tasks]
  );

  const variantOptions = useMemo(
    () => detail.platformVariants.map((v) => ({ id: v.id, label: socialEnumLabel(v.platform) })),
    [detail.platformVariants]
  );

  const rec = detail.strategicInsight;
  const followupOpportunityNotes = useMemo(() => {
    if (!agg) return [] as string[];
    const out: string[] = [];
    const { withEvent, withoutEvent } = agg.eventSplit;
    if (withEvent.n >= 1 && withoutEvent.n >= 1) {
      const w = withEvent.avgScore;
      const wo = withoutEvent.avgScore;
      if (Math.abs(w - wo) > 0.5) {
        out.push(
          w > wo
            ? "Event-anchored posts are outperforming in meaningful score — good moment for a recap or sign-up nudge."
            : "Non-event posts are leading on trust-weighted score — a standalone clarity or values piece may land well."
        );
      }
    }
    if (agg.byTone[0] && (agg.byTone[0]!.n ?? 0) >= 2) {
      out.push(
        `Top tone in recent data: ${socialEnumLabel(agg.byTone[0]!.tone)} (n=${agg.byTone[0]!.n}). Test the next run in that voice if it fits this campaign.`
      );
    } else {
      out.push("Label a few more posts with message tone so the system can recommend tone A/B with confidence.");
    }
    return out.slice(0, 3);
  }, [agg]);

  const runFollow = (which: "followup" | "county" | "volunteer" | "clarification") => {
    const fd = new FormData();
    fd.set("sourceSocialContentItemId", detail.id);
    const run = async () => {
      if (which === "followup") return createFollowupSocialItemFromAnalytics(fd);
      if (which === "county") return createCountyVariantFromAnalytics(fd);
      if (which === "volunteer") return createVolunteerCtaFromAnalytics(fd);
      return createClarificationPostFromAnalytics(fd);
    };
    startFollow(async () => {
      const r = await run();
      if (r.ok) {
        onRefresh();
        router.refresh();
        window.alert(`Created draft work item. Open the queue and select the new row (id ends …${r.id.slice(-6)}).`);
      } else window.alert(r.error);
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        <span className="font-medium text-slate-900">Campaign decision view.</span> Emphasis on tone, retention, and conversion — not a generic reach dashboard.
      </p>

      {aggErr ? <p className="text-xs text-amber-800">Could not load cross-post aggregates: {aggErr}</p> : null}
      {timing ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-500">Time window</span>
          {timing.windows.map((w, i) => (
            <UiButton
              key={w.dayRange}
              type="button"
              size="sm"
              variant={winIdx === i ? "default" : "outline"}
              className="h-8 rounded-lg text-xs"
              onClick={() => setWinIdx(i)}
            >
              {w.dayRange}d (n={w.aggregates.snapshotCount})
            </UiButton>
          ))}
        </div>
      ) : null}
      <AnalyticsPatternsSection agg={agg} windowLabel={windowLabel} confidenceHint={windowConfidence} />
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Tone performance (trust-first)</CardTitle>
          <CardDescription>
            Which voice and framing perform well on the meaningful score — and when threads look confused or heated on this
            item’s last snapshot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          {agg ? (
            <ul className="list-inside list-disc space-y-1.5">
              {toneTrustLines(agg, primary).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Load timing data to see cross-post tone ranks.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <UiButton
          type="button"
          className="rounded-xl"
          disabled={heuristicPending}
          onClick={() => {
            startHeuristic(async () => {
              const r = await applyHeuristicStrategicRecommendationsAction(detail.id);
              if (r.ok) onRefresh();
              else window.alert(r.error);
            });
          }}
        >
          {heuristicPending ? "…" : "Apply heuristics to recommendations"}
        </UiButton>
        <p className="text-[10px] text-slate-500">
          Fills structured fields from last 30d snapshots + this item (trust-weighted, not vanity). Edit before publishing.
        </p>
      </div>

      {rec ? (
        <Card className="rounded-3xl border-emerald-200/80 bg-emerald-50/20">
          <CardHeader>
            <CardTitle className="text-base">Recommended next move</CardTitle>
            <CardDescription>Structured, campaign-safe. Confidence {rec.confidenceScore != null ? rec.confidenceScore.toFixed(2) : "—"}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Next tone: </span>
              {rec.recommendedNextTone ? socialEnumLabel(rec.recommendedNextTone) : "—"}
            </p>
            <p>
              <span className="text-slate-500">Follow-up: </span>
              {socialEnumLabel(rec.recommendedFollowupType)}
            </p>
            <p className="sm:col-span-2">
              <span className="text-slate-500">Window: </span>
              {rec.recommendedBestWindow ?? "—"}
            </p>
            {rec.recommendedCountyFocus ? (
              <p className="sm:col-span-2">
                <span className="text-slate-500">County focus: </span>
                {rec.recommendedCountyFocus}
              </p>
            ) : null}
            {rec.recommendedCtaType ? (
              <p>
                <span className="text-slate-500">CTA: </span>
                {rec.recommendedCtaType}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Follow-up opportunities</CardTitle>
          <CardDescription>Signals from recent snapshots — pair with a draft action below, not a reach scoreboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {followupOpportunityNotes.length ? (
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-700">
              {followupOpportunityNotes.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Load aggregates to see event vs organic and tone hints.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Create follow-up in queue</h3>
        <p className="mb-2 text-xs text-slate-600">Draft <code className="rounded bg-slate-100 px-1">SocialContentItem</code> in the workbench. Copies linked event when present. Does not open Workflow Intake; extend here if you need intake rows.</p>
        <div className="flex flex-wrap gap-2">
          <UiButton type="button" size="sm" className="rounded-xl" disabled={followPending} onClick={() => runFollow("followup")}>
            Follow-up post
          </UiButton>
          <UiButton type="button" size="sm" variant="outline" className="rounded-xl" disabled={followPending} onClick={() => runFollow("county")}>
            County follow-up
          </UiButton>
          <UiButton type="button" size="sm" variant="outline" className="rounded-xl" disabled={followPending} onClick={() => runFollow("volunteer")}>
            Volunteer CTA
          </UiButton>
          <UiButton type="button" size="sm" variant="outline" className="rounded-xl" disabled={followPending} onClick={() => runFollow("clarification")}>
            Clarification post
          </UiButton>
        </div>
      </div>

      {detail.messageToneMode || detail.messageTacticMode ? (
        <p className="text-xs text-slate-600">
          Learning tags: {detail.messageToneMode ? <strong>tone {socialEnumLabel(detail.messageToneMode)}</strong> : null}
          {detail.messageToneMode && detail.messageTacticMode ? " · " : null}
          {detail.messageTacticMode ? <strong>framing {socialEnumLabel(detail.messageTacticMode)}</strong> : null}. Edit in the
          work item form.
        </p>
      ) : (
        <p className="text-xs text-amber-800/90">
          Set <strong>Message tone</strong> and optional <strong>message framing</strong> on the work item for better tone/tactic
          learning.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Signal summary</CardTitle>
            <CardDescription>Latest period (rollup if available).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!primary ? (
              <p className="text-sm text-slate-500">No performance rows yet. Log a period below or connect an importer later.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <MetricPill label="Impressions" value={primary.impressions} />
                  <MetricPill
                    label="Quality score"
                    value={primary.engagementQualityScore != null ? `${primary.engagementQualityScore.toFixed(0)}/100` : "—"}
                  />
                  {primaryEngagement && primary.engagementQualityScore == null ? (
                    <p className="col-span-full text-[10px] text-slate-500">
                      Weighted recompute: {primaryEngagement.weightedScore.toFixed(0)}/100 (saves/shares/comments/CTR/VCR/leads
                      emphasized; likes low — see <code className="rounded bg-slate-100 px-0.5">engagement-score.ts</code>).
                    </p>
                  ) : null}
                  <MetricPill
                    label="Dominant tone"
                    value={primary.dominantSentiment ? socialEnumLabel(primary.dominantSentiment) : "—"}
                  />
                  <MetricPill label="Comment rate" value={ratePart(primary.comments, primary.impressions)} />
                  <MetricPill label="Save rate" value={ratePart(primary.saves, primary.impressions)} />
                  <MetricPill label="CTR" value={primary.clickThroughRate != null ? pct(primary.clickThroughRate) : "—"} />
                  <MetricPill
                    label="Video completion"
                    value={primary.videoCompletionRate != null ? pct(primary.videoCompletionRate) : "—"}
                  />
                  <MetricPill label="Vol. leads" value={primary.volunteerLeadCount ?? "—"} />
                  <MetricPill label="Source" value={socialEnumLabel(primary.dataSource)} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Thread mix (sentiment)</p>
                  <SentimentChips breakdown={primary.sentimentBreakdown} />
                </div>
                {primary.notes ? (
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Notes: </span>
                    {primary.notes}
                  </p>
                ) : null}
                <p className="text-[10px] text-slate-500">
                  Period: {new Date(primary.periodStart).toLocaleString()} – {new Date(primary.periodEnd).toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Conversion & follow-through</CardTitle>
            <CardDescription>Tasks and events that close the loop on this work item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {detail.campaignEventId ? (
              <p>
                <span className="text-slate-600">Linked event: </span>
                <Link className="font-medium text-civic-slate underline" href={`/admin/events/${detail.campaignEventId}`}>
                  {detail.campaignEventTitle ?? "Open event"}
                </Link>
              </p>
            ) : (
              <p className="text-slate-500">No campaign event on this work item. Link an event in metadata/workflow to tighten conversion story.</p>
            )}
            {primary?.conversionCampaignEventId && primary.conversionEventTitle ? (
              <p>
                <span className="text-slate-600">Snapshot attributes conversion to: </span>
                <Link className="text-civic-slate underline" href={`/admin/events/${primary.conversionCampaignEventId}`}>
                  {primary.conversionEventTitle}
                </Link>
              </p>
            ) : null}
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Relevant CampaignTask (volunteer / comms / follow-up)</p>
              {conversionTasks.length === 0 ? (
                <p className="text-slate-500">None yet — create a pack from the Studio tab or the task board.</p>
              ) : (
                <ul className="space-y-1">
                  {conversionTasks.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-slate-800">{t.title}</span>
                      <span className="text-xs text-slate-500">
                        {socialEnumLabel(t.taskType)} · {socialEnumLabel(t.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/admin/tasks" className="inline-block text-sm text-civic-slate underline">
              Open full task board
            </Link>
          </CardContent>
        </Card>
      </div>

      {detail.performanceSnapshots.length > 1 ? (
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Recent periods</CardTitle>
            <CardDescription>Last few windows — use for before/after experiments, not vanity totals.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {detail.performanceSnapshots.slice(0, 5).map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="text-slate-600">
                    {new Date(s.periodStart).toLocaleDateString()} – {new Date(s.periodEnd).toLocaleDateString()}
                    {s.socialPlatformVariantId ? (
                      <UiBadge className="ml-2 border-slate-200 text-[10px] text-slate-600">variant</UiBadge>
                    ) : (
                      <UiBadge className="ml-2 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800">rollup</UiBadge>
                    )}
                  </span>
                  <span className="text-slate-700">
                    Q {s.engagementQualityScore != null ? s.engagementQualityScore.toFixed(0) : "—"}{" "}
                    <span className="text-slate-400">·</span> imp {s.impressions ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Strategic notes (readout + edit)</h3>
        {detail.strategicInsight ? (
          <div className="mb-4 grid gap-2 md:grid-cols-2">
            {(Object.keys(INSIGHT_LABELS) as InsightField[]).map((key) => {
              const text =
                key === "timingInsight"
                  ? detail.strategicInsight!.timingInsight
                  : key === "tonePerformance"
                    ? detail.strategicInsight!.tonePerformance
                    : key === "retentionSignal"
                      ? detail.strategicInsight!.retentionSignal
                      : detail.strategicInsight!.conversionSignal;
              return (
                <div key={key} className={cn("rounded-2xl border p-3", text ? "border-slate-200 bg-white" : "border-dashed border-slate-200 bg-slate-50/50")}>
                  <div className="text-[10px] font-bold uppercase text-slate-500">{INSIGHT_LABELS[key].title}</div>
                  <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{text || "— Not filled yet —"}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mb-3 text-sm text-slate-500">No saved strategic readout. Add your campaign-facing notes below.</p>
        )}
        <StrategicInsightForm detail={detail} onSaved={onRefresh} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">AI hooks (placeholders)</h3>
        <p className="mb-3 text-xs text-slate-600">
          Implementation path: <code className="rounded bg-slate-100 px-1 text-[10px]">src/lib/social/social-analytics-ai-stubs.ts</code> then persist into{" "}
          <code className="rounded bg-slate-100 px-1 text-[10px]">SocialContentStrategicInsight</code>.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <AiHookCard
            title="Classify comments"
            body="Map thread into supporter / curious / skeptical / … for moderation and reply scripts."
            stub={detail.strategicInsight?.aiCommentClassifyStub ?? null}
          />
          <AiHookCard
            title="Summarize post performance"
            body="Narrative vs. goals: reach is secondary to trust and follow-through."
            stub={detail.strategicInsight?.aiSummarizePerformanceStub ?? null}
          />
          <AiHookCard
            title="Suggest improvements"
            body="Next experiments: tone, timing, CTA, follow-up task triggers."
            stub={detail.strategicInsight?.aiSuggestImprovementsStub ?? null}
          />
        </div>
      </div>

      <ManualSnapshotForm detail={detail} onSaved={onRefresh} variantOptions={variantOptions} />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string | number | null | undefined }) {
  const show = value === null || value === undefined || value === "—" ? "—" : String(value);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
      <div className="text-[9px] font-bold uppercase text-slate-500">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-slate-900">{show}</div>
    </div>
  );
}
