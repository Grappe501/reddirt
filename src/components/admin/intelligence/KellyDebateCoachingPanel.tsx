"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KELLY_CLOSING_SCRIPTS,
  KELLY_ONLY_WOMAN_ON_STAGE,
  KELLY_OPENING_SCRIPTS,
  KELLY_PSYCHOLOGY_PREP,
  KELLY_STAGE_PRESENCE,
  PACKO_IN_DEBATE_PREP,
  THREE_WAY_DEBATE_STRATEGY,
} from "@/lib/intelligence/v4/kellyDebateCoaching";
import type { KellyCandidateSuggestion } from "@/lib/legislature/videoArchiveRoomManifest";

function CoachingSection({ block }: { block: { title: string; bullets: string[]; doNot: string[] } }) {
  return (
    <article className="rounded-xl border border-sky-100 bg-white p-5 text-xs">
      <h3 className="text-sm font-bold uppercase text-sky-950">{block.title}</h3>
      <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
        {block.bullets.map((b) => (
          <li key={b.slice(0, 48)}>{b}</li>
        ))}
      </ul>
      {block.doNot.length > 0 ? (
        <>
          <p className="mt-4 font-bold uppercase text-rose-900">Do not</p>
          <ul className="mt-2 list-inside list-disc text-rose-950">
            {block.doNot.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

export function KellyDebateCoachingPanel({
  suggestions,
  compact,
}: {
  suggestions: KellyCandidateSuggestion[];
  compact?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitSuggestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/intelligence/debate-coaching/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: String(fd.get("text")),
          category: String(fd.get("category")),
          createdBy: String(fd.get("createdBy") || "Kelly"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setStatus(data.ok ? "Saved — refresh to see in list." : data.error ?? "Failed");
      if (data.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {!compact ? (
        <article className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5 text-sm">
          <h2 className="font-heading text-xl font-bold text-kelly-navy">{THREE_WAY_DEBATE_STRATEGY.headline}</h2>
          <p className="mt-2 text-kelly-muted">
            <strong>Kelly:</strong> {THREE_WAY_DEBATE_STRATEGY.kellyRole}
          </p>
          <p className="mt-1 text-kelly-muted">
            <strong>Hammer:</strong> {THREE_WAY_DEBATE_STRATEGY.hammerRole}
          </p>
          <p className="mt-1 text-kelly-muted">
            <strong>Packo:</strong> {THREE_WAY_DEBATE_STRATEGY.packoRole}
          </p>
          <Link href="/admin/intelligence/video-archive-room" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
            Opponent video archive →
          </Link>
        </article>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Three-way cross lanes</h2>
        {THREE_WAY_DEBATE_STRATEGY.crossLanes.map((lane) => (
          <article key={lane.scenario} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
            <p className="font-bold text-violet-950">{lane.scenario}</p>
            <p className="mt-1 text-kelly-muted">Hammer: {lane.hammerLikely}</p>
            {"packoMayAdd" in lane && lane.packoMayAdd ? <p className="mt-1 text-kelly-muted">Packo: {lane.packoMayAdd}</p> : null}
            <p className="mt-2 font-semibold text-emerald-950">Kelly: {lane.kellyMove}</p>
          </article>
        ))}
      </section>

      {!compact ? (
        <article className="rounded-xl border border-amber-100 bg-amber-50/30 p-5 text-xs">
          <h3 className="font-bold uppercase text-amber-950">{PACKO_IN_DEBATE_PREP.headline}</h3>
          <p className="mt-2 text-amber-900">{PACKO_IN_DEBATE_PREP.spellingNote}</p>
          <p className="mt-3 font-bold">Kelly bridges</p>
          <ul className="mt-2 list-inside list-disc">
            {PACKO_IN_DEBATE_PREP.kellyBridges.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
          <Link href="/admin/intelligence/opponents" className="mt-3 inline-block font-bold text-kelly-navy underline">
            Packo opposition hub →
          </Link>
        </article>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <CoachingSection block={KELLY_ONLY_WOMAN_ON_STAGE} />
        <CoachingSection block={KELLY_STAGE_PRESENCE} />
      </div>
      <CoachingSection block={KELLY_PSYCHOLOGY_PREP} />

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Opening statements — rehearse standing</h2>
        <div className="space-y-3">
          {KELLY_OPENING_SCRIPTS.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Closing statements</h2>
        <div className="space-y-3">
          {KELLY_CLOSING_SCRIPTS.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border-2 border-kelly-navy/15 bg-white p-5">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Kelly&apos;s suggestions for staff</h2>
        <p className="mt-1 text-xs text-kelly-muted">Your lines, worries, or ideas — staff folds into prep packet after review.</p>
        <form onSubmit={submitSuggestion} className="mt-4 space-y-2 text-xs">
          <select name="category" className="w-full rounded border px-2 py-1" defaultValue="coaching">
            <option value="opening">Opening</option>
            <option value="closing">Closing</option>
            <option value="rebuttal">Rebuttal</option>
            <option value="coaching">Coaching / presence</option>
            <option value="other">Other</option>
          </select>
          <textarea name="text" required rows={3} placeholder="e.g. I want a softer line on clerks in the 60s opening…" className="w-full rounded border px-2 py-1" />
          <input name="createdBy" placeholder="Your name" className="w-full rounded border px-2 py-1" />
          <button type="submit" disabled={busy} className="rounded bg-kelly-navy px-3 py-1.5 font-bold text-white disabled:opacity-50">
            Submit suggestion
          </button>
        </form>
        {status ? <p className="mt-2 text-amber-900">{status}</p> : null}
        {suggestions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded border border-kelly-text/10 px-3 py-2 text-xs">
                <span className="font-mono text-[10px] uppercase text-kelly-subtle">{s.category}</span>
                <p className="mt-1">{s.text}</p>
                <p className="mt-1 text-[10px] text-kelly-subtle">{new Date(s.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-kelly-muted">No suggestions yet.</p>
        )}
      </section>
    </div>
  );
}

function ScriptCard({
  script,
}: {
  script: {
    label: string;
    durationSeconds: number;
    text: string;
    deliveryNotes: string[];
    claimsGate: string;
  };
}) {
  return (
    <article className="rounded-xl border border-kelly-navy/15 bg-kelly-page/20 p-4 text-xs">
      <div className="flex justify-between gap-2">
        <span className="font-bold text-kelly-navy">{script.label}</span>
        <span className="font-mono text-[10px] text-kelly-subtle">~{script.durationSeconds}s</span>
      </div>
      <p className="mt-3 leading-relaxed text-kelly-text">{script.text}</p>
      <p className="mt-2 text-[10px] text-amber-900">Claims: {script.claimsGate}</p>
      <ul className="mt-2 list-inside list-disc text-violet-900">
        {script.deliveryNotes.map((n) => (
          <li key={n.slice(0, 40)}>{n}</li>
        ))}
      </ul>
    </article>
  );
}
