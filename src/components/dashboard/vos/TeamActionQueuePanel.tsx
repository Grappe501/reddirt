"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import { DashboardDisclosure } from "@/components/dashboard/vos/DashboardDisclosure";
import { OPS_NOTIFICATION_PRIMARY_PUBLIC } from "@/config/ops-notification-public";
import { DISCORD_VOLUNTEER_BLURB } from "@/lib/volunteer-ops/discord-volunteer-copy";
import {
  buildCampaignUpdateDraft,
  buildHelpMailto,
  buildStepCampaignMailto,
  buildTeamActionQueueView,
  formatLane,
  getActionStepsForMaturity,
} from "@/lib/volunteer-ops/team-action-queue-demo";
import { VOS_MATURITY_LEVEL_TITLES } from "@/lib/volunteer-ops/vos-team-maturity";
import type { Team } from "@/types/dashboard";
import type { AutomationStep } from "@/types/automation-queue";

const ENCOURAGEMENTS = [
  "Nice — steady progress beats hero weeks. The next task keeps the triad aligned.",
  "Logged. Small weekly actions compound — thank your teammates for showing up.",
  "Great rhythm. When in doubt, escalate early — ops is here for policy and logistics.",
];

function pickEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)] ?? ENCOURAGEMENTS[0];
}

function ActionCard({
  label,
  step,
  teamSlug,
  onComplete,
}: {
  label: string;
  step: AutomationStep | null;
  teamSlug: string;
  onComplete: (step: AutomationStep) => void;
}) {
  if (!step) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-dashed border-kelly-text/20 bg-kelly-fog/30 p-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">{label}</p>
        <p className="mt-3 font-body text-sm text-kelly-text/60">No scripted task in this slot (preview list).</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-kelly-text/12 bg-white p-4 shadow-sm">
      <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-navy/55">{label}</p>
      <h4 className="mt-2 font-heading text-sm font-bold leading-snug text-kelly-navy">{step.title}</h4>
      <dl className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/75">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-kelly-deep/80">Lane</dt>
          <dd>{formatLane(step.lane)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-kelly-deep/80">Owner</dt>
          <dd>{step.ownerRole}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-kelly-deep/80">Due</dt>
          <dd>{step.dueTiming}</dd>
        </div>
      </dl>
      <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/80">{step.summary}</p>
      <DashboardDisclosure summary="Learn more" className="mt-2 border-kelly-text/8">
        <p className="font-body text-xs leading-relaxed text-kelly-text/80">{step.dashboardTaskCopy}</p>
        <p className="mt-2 font-body text-[11px] text-kelly-text/60">
          Email scaffold (not sent automatically): <span className="font-semibold text-kelly-deep">{step.emailSubject}</span>
        </p>
      </DashboardDisclosure>
      <p className="mt-3 font-body text-[10px] text-kelly-text/50">Preview action — persistence coming soon.</p>
      <div className="mt-auto flex flex-col gap-2 pt-3">
        <button
          type="button"
          className="rounded-lg border border-kelly-success/35 bg-kelly-success/[0.12] px-3 py-2 font-body text-xs font-semibold text-kelly-deep hover:bg-kelly-success/20"
          onClick={() => onComplete(step)}
        >
          Mark complete
        </button>
        <a
          href={buildHelpMailto(step.title)}
          className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.04] px-3 py-2 text-center font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-navy/10"
        >
          Need help
        </a>
        <a
          href={buildStepCampaignMailto(step)}
          className="text-center font-body text-xs font-semibold text-kelly-blue underline hover:text-kelly-navy"
        >
          Email campaign (mailto draft)
        </a>
        <Link
          href={`/dashboard/team/${teamSlug}/messages#automation-templates`}
          className="text-center font-body text-[11px] text-kelly-text/60 underline"
        >
          Template library →
        </Link>
      </div>
    </div>
  );
}

export function TeamActionQueuePanel({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [lastDraft, setLastDraft] = useState<ReturnType<typeof buildCampaignUpdateDraft> | null>(null);

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const view = useMemo(() => buildTeamActionQueueView(team, completedSet), [team, completedSet]);
  const fullSequence = useMemo(() => getActionStepsForMaturity(view.maturityLevel), [view.maturityLevel]);

  const dashboardUrl =
    typeof window !== "undefined" ? `${window.location.origin}/dashboard/team/${teamSlug}` : `/dashboard/team/${teamSlug}`;

  function handleComplete(step: AutomationStep) {
    if (completedSet.has(step.id)) return;
    const nextSet = new Set([...completedIds, step.id]);
    setCompletedIds(Array.from(nextSet));
    setEncouragement(pickEncouragement());
    const next = buildTeamActionQueueView(team, nextSet).neededNow;
    setLastDraft(
      buildCampaignUpdateDraft({
        teamName: team.displayName,
        completedTaskTitle: step.title,
        completedLane: formatLane(step.lane),
        nextTaskTitle: next?.title ?? null,
        teamNotes: "",
        dashboardUrl,
      }),
    );
  }

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Action Queue</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">The next three actions your team should focus on</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Guided by the team maturity model ({VOS_MATURITY_LEVEL_TITLES[view.maturityLevel]} · Level {view.maturityLevel}). Only
            three tasks stay visible so dashboards stay calm; completing work surfaces what is next.
          </p>
        </div>
        <Link
          href={`/dashboard/team/${teamSlug}/training#action-queue-automation`}
          className="shrink-0 font-body text-xs font-semibold text-kelly-blue underline"
        >
          Training note →
        </Link>
      </div>

      <p className="mt-3 rounded-lg border border-kelly-gold/30 bg-kelly-gold/[0.08] px-3 py-2 font-body text-xs text-kelly-deep/90">
        {DISCORD_VOLUNTEER_BLURB}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ActionCard label="Needed Now" step={view.neededNow} teamSlug={teamSlug} onComplete={handleComplete} />
        <ActionCard label="Coming Up" step={view.comingUp} teamSlug={teamSlug} onComplete={handleComplete} />
        <ActionCard label="Next After That" step={view.nextAfterThat} teamSlug={teamSlug} onComplete={handleComplete} />
      </div>

      {encouragement ? (
        <p className="mt-4 rounded-lg border border-kelly-success/25 bg-kelly-success/[0.08] px-3 py-2 font-body text-sm text-kelly-deep">
          {encouragement}
        </p>
      ) : null}

      {lastDraft ? (
        <div className="mt-4 rounded-xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-4">
          <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-navy/60">Campaign update draft (preview)</p>
          <p className="mt-1 font-body text-xs text-kelly-text/70">
            Ops inbox: <span className="font-mono text-kelly-deep">{OPS_NOTIFICATION_PRIMARY_PUBLIC}</span> — human review before
            send. Not delivered automatically in Script 6.
          </p>
          <p className="mt-2 font-body text-sm font-semibold text-kelly-navy">{lastDraft.subject}</p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-kelly-text/10 bg-white p-3 font-body text-[11px] text-kelly-text/85">
            {lastDraft.body}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyTextButton text={lastDraft.body} label="Copy body" />
            <a
              href={lastDraft.mailtoHref}
              className="inline-flex items-center rounded-lg border border-kelly-blue/30 bg-kelly-blue/[0.08] px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-blue/15"
            >
              Open mailto draft
            </a>
          </div>
        </div>
      ) : null}

      <DashboardDisclosure summary="View full sequence (hidden upcoming steps)" className="mt-5">
        <p className="font-body text-xs text-kelly-text/75">
          Steps 4–5 in your current queue window stay here so the overview stays light. Checked items are completed in this browser
          session only.
        </p>
        {view.hiddenFutureSteps.length ? (
          <ul className="mt-3 space-y-2">
            {view.hiddenFutureSteps.map((s) => (
              <li key={s.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-xs text-kelly-text/85">
                <span className="font-semibold text-kelly-navy">{s.title}</span>
                <span className="text-kelly-text/55"> · {formatLane(s.lane)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 font-body text-xs text-kelly-text/60">No additional hidden steps in the current window.</p>
        )}
        <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">Full maturity sequence</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-xs text-kelly-text/80">
          {fullSequence.map((s) => (
            <li key={s.id} className={completedSet.has(s.id) ? "text-kelly-text/45 line-through" : ""}>
              {s.title}
            </li>
          ))}
        </ol>
      </DashboardDisclosure>
    </section>
  );
}
