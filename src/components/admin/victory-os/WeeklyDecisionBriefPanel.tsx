"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { addWeeks } from "@/lib/calendar/weekly-time";
import type { CountyVictoryContext, WeeklyCampaignDecision, WeeklyDecisionBrief } from "@/lib/victory-os/types";

type Props = {
  initialBrief: WeeklyDecisionBrief;
  weekKey: string;
  snapshots: string[];
  fromSnapshot: boolean;
};

const OPS_BADGE: Record<string, string> = {
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-amber-100 text-amber-900 border-amber-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const PACE_LABEL: Record<string, string> = {
  ahead: "Ahead of pace",
  on_pace: "On pace",
  behind: "Behind pace",
  unknown: "Pace unknown",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-kelly-page text-kelly-muted border-kelly-text/15",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  declined: "bg-red-50 text-red-800 border-red-200",
  modified: "bg-amber-50 text-amber-900 border-amber-200",
};

function DecisionCard({
  decision,
  onStatus,
  busy,
}: {
  decision: WeeklyCampaignDecision;
  onStatus: (id: string, status: WeeklyCampaignDecision["status"]) => void;
  busy: boolean;
}) {
  return (
    <article className="rounded-2xl border border-kelly-text/10 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-muted">
            Decision #{decision.rank}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">
            <Link href={`/admin/counties/${decision.countySlug}`} className="hover:underline">
              {decision.displayName}
            </Link>
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${OPS_BADGE[decision.opsStatus]}`}
          >
            {decision.opsStatus}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[decision.status]}`}
          >
            {decision.status}
          </span>
        </div>
      </div>

      <p className="mt-3 font-body text-base font-semibold leading-snug text-kelly-navy">{decision.recommendation}</p>
      <p className="mt-2 font-body text-sm text-kelly-text/85">{decision.reason}</p>

      <dl className="mt-4 grid gap-2 font-body text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold uppercase tracking-wider text-kelly-muted">Resource</dt>
          <dd className="mt-0.5 capitalize text-kelly-text">{decision.resourceType.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-wider text-kelly-muted">Kelly tier</dt>
          <dd className="mt-0.5 text-kelly-text">Tier {decision.kellyTier}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-wider text-kelly-muted">Expected outcome</dt>
          <dd className="mt-0.5 text-kelly-text">{decision.expectedOutcome}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-wider text-kelly-muted">Priority score</dt>
          <dd className="mt-0.5 font-mono text-kelly-text">{decision.deploymentPriority}</dd>
        </div>
        {decision.linkedMissionId ? (
          <div className="sm:col-span-2">
            <dt className="font-bold uppercase tracking-wider text-kelly-muted">Linked mission</dt>
            <dd className="mt-0.5">
              <Link
                href={`/admin/mission-brief?view=missions&week=${decision.weekKey}`}
                className="font-mono text-xs text-kelly-navy underline"
              >
                {decision.linkedMissionId}
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      {decision.status === "pending" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(decision.id, "approved")}
            className="rounded-full bg-kelly-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-kelly-slate disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(decision.id, "declined")}
            className="rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(decision.id, "modified")}
            className="rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
          >
            Modified
          </button>
        </div>
      ) : null}
    </article>
  );
}

function CountyChipList({ title, counties }: { title: string; counties: CountyVictoryContext[] }) {
  if (counties.length === 0) return null;
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-white/70 p-4">
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {counties.map((c) => (
          <li key={c.countySlug}>
            <Link
              href={`/admin/counties/${c.countySlug}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${OPS_BADGE[c.opsStatus]}`}
            >
              {c.county}
              <span className="font-mono opacity-70">{c.deploymentPriority.deploymentPriority}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WeeklyDecisionBriefPanel({ initialBrief, weekKey, snapshots, fromSnapshot }: Props) {
  const [brief, setBrief] = useState(initialBrief);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const regenerate = useCallback(() => {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch("/api/admin/victory-os/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate", weekKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setBrief(data.brief);
        setMessage("Brief regenerated and saved.");
      } else setMessage("Regenerate failed.");
    });
  }, [weekKey]);

  const onStatus = useCallback(
    (decisionId: string, status: WeeklyCampaignDecision["status"]) => {
      startTransition(async () => {
        setMessage(null);
        const res = await fetch("/api/admin/victory-os/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", weekKey, decisionId, status }),
        });
        const data = await res.json();
        if (data.ok) {
          setBrief(data.brief);
          setMessage(`Decision marked ${status}.`);
        } else setMessage("Status update failed — regenerate brief first.");
      });
    },
    [weekKey],
  );

  const prevWeek = addWeeks(weekKey, -1);
  const nextWeek = addWeeks(weekKey, 1);
  const pace = brief.statewideVictory.pace;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border-2 border-kelly-navy/25 bg-gradient-to-br from-kelly-navy/[0.08] via-white to-amber-500/[0.06] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">
              Layer 1 · Monday decisions
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
              What must we decide this week?
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/85">
              {brief.statewideVictory.summary}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Victory pace</p>
            <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">{PACE_LABEL[pace] ?? pace}</p>
            <p className="mt-1 font-body text-xs text-kelly-muted">{brief.seasonLabel}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 font-body text-sm">
          <span className="rounded-full border border-kelly-text/15 bg-white/80 px-3 py-1">
            Gap: {brief.statewideVictory.statewideVoteGap.toLocaleString()} votes
          </span>
          <span className="rounded-full border border-kelly-text/15 bg-white/80 px-3 py-1">
            Target: {brief.statewideVictory.workingTargetWithCushion.toLocaleString()}
          </span>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-900">
            INTERNAL_DRAFT · CM review required
          </span>
          {fromSnapshot ? (
            <span className="text-xs text-kelly-muted">Loaded from snapshot</span>
          ) : (
            <span className="text-xs text-amber-800">Live generated — save with Regenerate</span>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/mission-brief?week=${prevWeek}&view=decisions`}
            className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-kelly-page"
          >
            ← Prev week
          </Link>
          <span className="font-mono text-sm text-kelly-navy">{weekKey}</span>
          <Link
            href={`/admin/mission-brief?week=${nextWeek}&view=decisions`}
            className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-kelly-page"
          >
            Next week →
          </Link>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={regenerate}
          className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white hover:bg-kelly-slate disabled:opacity-50"
        >
          Regenerate & save brief
        </button>
      </div>

      {message ? <p className="font-body text-sm text-kelly-slate">{message}</p> : null}

      <section>
        <h3 className="font-heading text-xl font-bold text-kelly-navy">Top 10 decisions</h3>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          Ranked by deployment priority — approve each before Kelly, volunteers, or spend deploy.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {brief.topDecisions.map((d) => (
            <DecisionCard key={d.id} decision={d} onStatus={onStatus} busy={pending} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Kelly deployment</p>
          <ul className="mt-2 space-y-2 font-body text-sm">
            {brief.kellyDeployment.length === 0 ? (
              <li className="text-kelly-muted">No Tier 1–2 Kelly slots this week.</li>
            ) : (
              brief.kellyDeployment.map((d) => (
                <li key={d.id}>
                  <strong>{d.county}</strong> · T{d.kellyTier} · {d.recommendation.slice(0, 80)}…
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/10 bg-white/70 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Volunteer deployment</p>
          <ul className="mt-2 space-y-2 font-body text-sm">
            {brief.volunteerDeployment.slice(0, 5).map((d) => (
              <li key={d.id}>
                <strong>{d.county}</strong> · {d.resourceType.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/10 bg-white/70 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Fundraising unlocks</p>
          <ul className="mt-2 space-y-2 font-body text-sm">
            {brief.fundraisingDeployment.length === 0 ? (
              <li className="text-kelly-muted">No fundraising unlocks flagged.</li>
            ) : (
              brief.fundraisingDeployment.map((d) => (
                <li key={d.id}>
                  <strong>{d.county}</strong> · {d.expectedOutcome}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CountyChipList title="Counties at risk" counties={brief.countiesAtRisk} />
        <CountyChipList title="Strategic opportunities" counties={brief.strategicOpportunities} />
      </div>

      {snapshots.length > 1 ? (
        <p className="font-body text-xs text-kelly-muted">
          Saved briefs: {snapshots.slice(0, 6).join(", ")}
          {snapshots.length > 6 ? ` +${snapshots.length - 6} more` : ""}
        </p>
      ) : null}
    </div>
  );
}
