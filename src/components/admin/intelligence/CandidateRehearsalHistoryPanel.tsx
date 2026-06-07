"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { RehearsalActiveSession, RehearsalSessionHistoryEntry } from "@/lib/intelligence/v4/phase16P6SessionMemoryState";

export function CandidateRehearsalHistoryPanel({
  active,
  history,
}: {
  active: RehearsalActiveSession | null;
  history: RehearsalSessionHistoryEntry[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  async function clearMemory() {
    setClearing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/rehearsal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setMessage(data.ok ? "Session memory cleared." : "Could not clear memory.");
      if (data.ok) router.refresh();
    } catch {
      setMessage("Could not clear memory.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-sky-200 bg-sky-50/40 p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Active session</h2>
        {active ? (
          <>
            <p className="mt-2 font-bold text-kelly-navy">{active.label}</p>
            <p className="mt-1 text-xs text-kelly-muted">
              Step {active.cardNumber}/{active.totalSteps} · {active.sessionKind} · updated{" "}
              {active.updatedAt.slice(0, 19)}
            </p>
            <Link
              href={active.continueHref}
              className="mt-4 inline-block rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-xs font-bold text-white"
            >
              Continue drill →
            </Link>
          </>
        ) : (
          <p className="mt-2 text-xs text-kelly-muted">No active drill — start a queue or encounter to begin tracking.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Session history</h2>
          <button
            type="button"
            disabled={clearing}
            onClick={clearMemory}
            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-950 disabled:opacity-40"
          >
            Staff reset
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-kelly-muted">History empty — drills appear here as Kelly rehearses.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry) => (
              <li key={entry.entryId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-kelly-navy">{entry.label}</p>
                    <p className="mt-1 text-kelly-muted">{entry.stepLabel}</p>
                  </div>
                  <p className="font-mono text-[10px] text-kelly-subtle">{entry.recordedAt.slice(0, 19)}</p>
                </div>
                <Link href={entry.continueHref} className="mt-2 inline-block font-bold text-sky-800 underline">
                  Continue →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message ? <p className="text-xs font-semibold text-kelly-navy">{message}</p> : null}
    </div>
  );
}
