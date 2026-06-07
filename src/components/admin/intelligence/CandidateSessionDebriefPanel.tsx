"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PreStageChecklistItem } from "@/lib/intelligence/v4/phase16P4SessionDebrief";
import type { SessionDebriefCapture } from "@/lib/intelligence/v4/phase16P4SessionDebriefState";

function statusColor(status: PreStageChecklistItem["autoStatus"]) {
  if (status === "pass") return "border-emerald-200 bg-emerald-50/50 text-emerald-950";
  if (status === "warn") return "border-amber-200 bg-amber-50/50 text-amber-950";
  return "border-slate-200 bg-slate-50/50 text-slate-950";
}

export function CandidateSessionDebriefPanel({
  checklist,
  recentCaptures,
  actionQueueHref,
}: {
  checklist: PreStageChecklistItem[];
  recentCaptures: SessionDebriefCapture[];
  actionQueueHref: string;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [feltRisky, setFeltRisky] = useState("");
  const [staffFollowUps, setStaffFollowUps] = useState("");
  const [encounterHint, setEncounterHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleItem(itemId: string) {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function confirmChecklist() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/session-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm-checklist",
          confirmedIds: [...confirmed],
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setMessage(data.ok ? "Pre-stage checklist saved." : "Could not save checklist.");
      if (data.ok) router.refresh();
    } catch {
      setMessage("Could not save checklist.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCapture() {
    const felt = feltRisky
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const followUps = staffFollowUps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (felt.length === 0 && followUps.length === 0) {
      setMessage("Add at least one felt-risky line or staff follow-up.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/session-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "capture",
          feltRisky: felt,
          staffFollowUps: followUps,
          encounterHint: encounterHint.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setFeltRisky("");
        setStaffFollowUps("");
        setEncounterHint("");
        setMessage("Post-session capture saved — staff reviews via human action queue.");
        router.refresh();
      } else {
        setMessage("Could not save capture.");
      }
    } catch {
      setMessage("Could not save capture.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Pre-stage checklist</h2>
        <ol className="space-y-3">
          {checklist.map((item) => (
            <li key={item.itemId} className={`rounded-xl border p-4 text-sm ${statusColor(item.autoStatus)}`}>
              <div className="flex flex-wrap items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed.has(item.itemId)}
                  onChange={() => toggleItem(item.itemId)}
                  className="mt-1 h-4 w-4"
                  aria-label={`Confirm ${item.title}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-bold text-kelly-navy">
                      {item.order}. {item.title}
                    </p>
                    <span className="font-mono text-[10px] uppercase">{item.statusLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-kelly-muted">{item.description}</p>
                  <p className="mt-2 text-[10px] italic">{item.kellyBeat}</p>
                  <Link href={item.href} className="mt-2 inline-block text-[10px] font-bold underline">
                    Open →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={submitting || confirmed.size === 0}
          onClick={confirmChecklist}
          className="mt-4 rounded-full border border-indigo-400 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-950 disabled:opacity-40"
        >
          Save pre-stage confirmation
        </button>
      </section>

      <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Post-session capture</h2>
        <p className="mt-2 text-xs text-kelly-muted">
          Candidate read-only write — staff reviews follow-ups on the human action queue. No LLM, no auto-publish.
        </p>
        <label className="mt-4 block text-xs font-bold uppercase text-kelly-subtle">
          Felt risky on stage (one per line)
          <textarea
            value={feltRisky}
            onChange={(e) => setFeltRisky(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white p-3 text-sm font-normal normal-case"
            placeholder="Line I tried that felt shaky…"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase text-kelly-subtle">
          Staff follow-ups needed (one per line)
          <textarea
            value={staffFollowUps}
            onChange={(e) => setStaffFollowUps(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white p-3 text-sm font-normal normal-case"
            placeholder="Verify CVSGF total before next clerk room…"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase text-kelly-subtle">
          Encounter hint (optional)
          <input
            value={encounterHint}
            onChange={(e) => setEncounterHint(e.target.value)}
            className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white p-2 text-sm font-normal normal-case"
            placeholder="ACCA panel · Jun 11"
          />
        </label>
        <button
          type="button"
          disabled={submitting}
          onClick={submitCapture}
          className="mt-4 rounded-full border border-rose-400 bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          Submit post-session capture
        </button>
        <Link href={actionQueueHref} className="ml-3 inline-block text-xs font-bold text-kelly-navy underline">
          Human action queue →
        </Link>
      </section>

      {message ? <p className="text-xs font-semibold text-kelly-navy">{message}</p> : null}

      {recentCaptures.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Recent captures</h2>
          <ul className="space-y-3">
            {recentCaptures.map((capture) => (
              <li key={capture.captureId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
                <p className="font-mono text-[10px] text-kelly-subtle">{capture.capturedAt.slice(0, 19)}</p>
                {capture.encounterHint ? <p className="mt-1 font-bold">{capture.encounterHint}</p> : null}
                {capture.feltRisky.length > 0 ? (
                  <p className="mt-2">
                    <span className="font-bold text-rose-900">Felt risky:</span> {capture.feltRisky.join(" · ")}
                  </p>
                ) : null}
                {capture.staffFollowUps.length > 0 ? (
                  <p className="mt-2">
                    <span className="font-bold text-indigo-900">Staff follow-ups:</span>{" "}
                    {capture.staffFollowUps.join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
