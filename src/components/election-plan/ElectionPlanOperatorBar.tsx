"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";

import { EpButton } from "@/components/election-plan/ui/EpButton";

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
      <div className="ep-operator-bar ep-operator-bar-signed-in">
        <p className="flex flex-wrap items-center gap-2 text-[var(--ep-navy)]">
          <span className="ep-operator-initials">{currentInitials}</span>
          <span>
            {currentDisplayName ? (
              <>
                <strong>{currentDisplayName}</strong>
                <span className="text-[var(--ep-navy-muted)]"> · </span>
              </>
            ) : null}
            <span className="text-[var(--ep-navy-muted)]">Field entries tagged with your initials</span>
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
            Operators
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)] hover:underline"
          >
            Switch initials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-operator-bar ep-operator-bar-prompt">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">Operator sign-in</p>
        <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">Required to log field results and county visits</p>
      </div>
      <form onSubmit={signIn} className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="ep-input-label">Initials</span>
          <input
            type="text"
            maxLength={3}
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            placeholder="KGR"
            className="ep-input w-20 font-mono uppercase tracking-widest"
            autoComplete="off"
          />
        </label>
        <EpButton type="submit" size="sm" disabled={busy || initials.length !== 3}>
          {busy ? "…" : "Sign in"}
        </EpButton>
        <Link href="/election-plan/operators" className="py-2 text-xs text-[var(--ep-navy-muted)] hover:underline">
          Request access
        </Link>
      </form>
      {error ? <p className="mt-2 w-full text-xs text-[var(--ep-accent)]">{error}</p> : null}
    </div>
  );
}
