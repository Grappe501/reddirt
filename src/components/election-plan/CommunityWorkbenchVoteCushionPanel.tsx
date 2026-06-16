"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  formatCushionPercent,
  type VoteCushionView,
} from "@/lib/election-plan/community-workbench/vote-cushion";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  cushion: VoteCushionView;
  operatorInitials: string | null;
};

export function CommunityWorkbenchVoteCushionPanel({ slug, cushion, operatorInitials }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"percent" | "votes">(
    cushion.localTargetVotes != null && cushion.hasLocalCushion && cushion.label?.includes("%") === false
      ? "votes"
      : "percent",
  );
  const [label, setLabel] = useState(cushion.label ?? "");
  const [pct, setPct] = useState(
    cushion.hasLocalCushion && cushion.localPercentIncrease != null
      ? String(Math.round(cushion.localPercentIncrease * 10) / 10)
      : "",
  );
  const [votes, setVotes] = useState(
    cushion.localTargetVotes != null && cushion.hasLocalCushion ? String(cushion.localTargetVotes) : "",
  );
  const [notes, setNotes] = useState(cushion.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayTarget = cushion.hasLocalCushion && cushion.localTargetVotes != null
    ? cushion.localTargetVotes
    : cushion.globalTargetVotes;
  const displayGain = cushion.hasLocalCushion && cushion.localVoteGain != null
    ? cushion.localVoteGain
    : cushion.globalVoteGain;
  const displayPct = cushion.hasLocalCushion && cushion.localPercentIncrease != null
    ? cushion.localPercentIncrease
    : cushion.globalPercentIncrease;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!operatorInitials) {
      setError("Sign in with operator initials to set a local cushion.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload =
        mode === "percent"
          ? {
              label: label.trim() || undefined,
              targetIncreasePct: pct.trim() ? Number(pct) : null,
              notes: notes.trim() || undefined,
            }
          : {
              label: label.trim() || undefined,
              targetVotes: votes.trim() ? Number(votes) : null,
              notes: notes.trim() || undefined,
            };
      const res = await fetch(`/api/election-plan/workbenches/${slug}/vote-cushion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function clearCushion() {
    if (!operatorInitials) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/election-plan/workbenches/${slug}/vote-cushion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Clear failed");
        return;
      }
      setPct("");
      setVotes("");
      setLabel("");
      setNotes("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="vote-cushion" className="mb-10 scroll-mt-28 rounded-xl border border-[var(--ep-border)] bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Local field cushion</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">Vote target — local boost</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Set a higher local target for this team. Statewide snapshot numbers stay locked — this cushion only applies here
        and boosts your field plan.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label={cushion.hasLocalCushion ? "Local vote target" : "Vote target (statewide)"}
          value={formatVotes(displayTarget)}
          highlight={cushion.hasLocalCushion}
        />
        <MetricCard
          label="Required increase"
          value={formatCushionPercent(displayPct)}
          highlight={cushion.hasLocalCushion}
        />
        <MetricCard label="Gain needed" value={`+${formatVotes(displayGain)}`} highlight={cushion.hasLocalCushion} />
      </div>

      {cushion.hasLocalCushion && cushion.weeklyVoteGoal != null ? (
        <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">
          Local pace: <strong className="text-[var(--ep-navy)]">{formatVotes(cushion.weeklyVoteGoal)}/week</strong>
          {cushion.powerOf5LeadersNeeded != null ? (
            <> · {cushion.powerOf5LeadersNeeded} Po5 leaders</>
          ) : null}
        </p>
      ) : null}

      <div className="mt-4 rounded-lg border border-dashed border-[var(--ep-border)] bg-[var(--ep-cream)]/50 px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        <p>
          <span className="font-semibold text-[var(--ep-navy)]">Statewide plan (locked): </span>
          {formatVotes(cushion.globalTargetVotes)} target · {formatCushionPercent(cushion.globalPercentIncrease)} · +
          {formatVotes(cushion.globalVoteGain)} from baseline {formatVotes(cushion.globalBaseline)}
        </p>
      </div>

      <form onSubmit={save} className="mt-5 space-y-3 border-t border-[var(--ep-border)] pt-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("percent")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              mode === "percent" ? "bg-[var(--ep-navy)] text-white" : "border border-[var(--ep-border)] bg-white",
            )}
          >
            Set by % increase
          </button>
          <button
            type="button"
            onClick={() => setMode("votes")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              mode === "votes" ? "bg-[var(--ep-navy)] text-white" : "border border-[var(--ep-border)] bg-white",
            )}
          >
            Set by vote target
          </button>
        </div>

        <label className="block text-sm">
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Label (optional)</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="25% SOS lift · Festiville goal"
            className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
          />
        </label>

        {mode === "percent" ? (
          <label className="block text-sm">
            <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Local % increase over baseline</span>
            <input
              type="number"
              min={0}
              max={500}
              step={0.1}
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder="25"
              className="mt-1 w-full max-w-xs rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
              Baseline {formatVotes(cushion.globalBaseline)} × your % = local target
            </p>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Local vote target (absolute)</span>
            <input
              type="number"
              min={1}
              value={votes}
              onChange={(e) => setVotes(e.target.value)}
              placeholder="6086"
              className="mt-1 w-full max-w-xs rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Why this cushion — Festiville, ward plan, etc."
            className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save local cushion"}
          </button>
          {cushion.hasLocalCushion ? (
            <button
              type="button"
              disabled={busy}
              onClick={clearCushion}
              className="rounded-lg border border-[var(--ep-border)] px-4 py-2 text-sm font-semibold text-[var(--ep-navy-muted)]"
            >
              Clear cushion
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-3",
        highlight ? "border-[var(--ep-gold)] bg-[var(--ep-cream)]" : "border-[var(--ep-border)]",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">{value}</p>
    </div>
  );
}
