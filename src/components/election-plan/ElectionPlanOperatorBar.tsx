"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";

type Props = {
  currentInitials: string | null;
  currentDisplayName: string | null;
};

export function ElectionPlanOperatorBar({ currentInitials, currentDisplayName }: Props) {
  const router = useRouter();
  const [initials, setInitials] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/election-plan/operator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initials }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Sign-in failed");
          return;
        }
        router.refresh();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [initials, router],
  );

  const signOut = useCallback(async () => {
    await fetch("/api/election-plan/operator", { method: "DELETE" });
    router.refresh();
  }, [router]);

  if (currentInitials) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ep-gold)] bg-[var(--ep-cream)] px-3 py-2 text-sm">
        <p className="text-[var(--ep-navy)]">
          Signed in as{" "}
          <strong className="font-mono tracking-widest">{currentInitials}</strong>
          {currentDisplayName ? ` · ${currentDisplayName}` : null}
          <span className="ml-2 text-xs text-[var(--ep-navy-muted)]">— entries tagged with your initials</span>
        </p>
        <div className="flex gap-2">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy)] underline">
            Operators
          </Link>
          <button type="button" onClick={signOut} className="text-xs font-semibold text-[var(--ep-navy-muted)] underline">
            Switch initials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Operator sign-in required to log field results</p>
      <form onSubmit={signIn} className="mt-2 flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase text-amber-900">3-letter initials</span>
          <input
            type="text"
            maxLength={3}
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            placeholder="KGR"
            className="mt-1 w-20 rounded border border-amber-200 px-2 py-1.5 font-mono text-sm uppercase tracking-widest"
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={busy || initials.length !== 3}
          className="rounded bg-[var(--ep-navy)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {busy ? "…" : "Sign in"}
        </button>
        <Link href="/election-plan/operators" className="py-2 text-xs text-[var(--ep-navy-muted)] underline">
          Request access
        </Link>
      </form>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
