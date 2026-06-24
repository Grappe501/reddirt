"use client";

import { useCallback, useState, type FormEvent } from "react";

import {
  FIELD_ENTRY_CATEGORIES,
  type FieldEntryCategory,
  type FieldEntryLocationSummary,
} from "@/lib/election-plan/field-entry/types";

type Props = {
  countySlug: string;
  countyName: string;
  citySlug?: string | null;
  cityName?: string | null;
  initial: FieldEntryLocationSummary;
  operatorInitials: string | null;
  onLogged?: () => void;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function ElectionPlanFieldEntryPanel({
  countySlug,
  countyName,
  citySlug,
  cityName,
  initial,
  operatorInitials,
  onLogged,
}: Props) {
  const [summary, setSummary] = useState(initial);
  const [category, setCategory] = useState<FieldEntryCategory>("volunteer");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const locationLabel = cityName ? `${cityName}, ${countyName} County` : `${countyName} County`;

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ countySlug });
    if (citySlug) params.set("citySlug", citySlug);
    const res = await fetch(`/api/election-plan/field-entries?${params}`);
    if (res.ok) {
      const data = (await res.json()) as FieldEntryLocationSummary;
      setSummary({
        entries: data.entries,
        rollups: data.rollups,
        totalQuantity: data.totalQuantity,
      });
    }
  }, [countySlug, citySlug]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!operatorInitials) {
        setError("Sign in with your 3-letter initials above before logging.");
        return;
      }
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch("/api/election-plan/field-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            label,
            description: description || undefined,
            quantity,
            countySlug,
            citySlug: citySlug ?? null,
          }),
        });
        const data = (await res.json()) as { error?: string; entry?: { operatorInitials: string; label: string } };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
        setLabel("");
        setDescription("");
        setQuantity(1);
        setSuccess(
          `[${data.entry?.operatorInitials ?? operatorInitials}] logged · ${data.entry?.label ?? label}`,
        );
        await refresh();
        onLogged?.();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [operatorInitials, category, label, description, quantity, countySlug, citySlug, refresh, onLogged],
  );

  return (
    <section className="ep-card border-2 border-[var(--ep-navy)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Live field log · Database</p>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{locationLabel}</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Log followers, volunteers, leaders, and email contacts — goes live immediately. Every row is tagged with
            operator initials.
          </p>
        </div>
        <p className="text-right text-2xl font-bold tabular-nums text-[var(--ep-navy)]">{summary.totalQuantity}</p>
      </div>

      {summary.rollups.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {summary.rollups.map((r) => (
            <li key={r.category} className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{r.label}</p>
              <p className="font-heading text-xl font-bold text-[var(--ep-navy)]">{r.totalQuantity}</p>
              <p className="text-xs text-[var(--ep-navy-muted)]">{r.entryCount} entries</p>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-3 border-t border-[var(--ep-border)] pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FieldEntryCategory)}
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-2 py-2 text-[var(--ep-navy)]"
            >
              {FIELD_ENTRY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Quantity</span>
            <input
              type="number"
              min={1}
              max={10000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-2 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Name / label</span>
          <input
            type="text"
            required
            maxLength={200}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Person or team name, host, organization…"
            className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={2}
            placeholder="Context — event, relationship, next step…"
            className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !operatorInitials}
          className="rounded-md bg-[var(--ep-navy)] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : operatorInitials ? `[${operatorInitials}] Log to database` : "Sign in with initials to log"}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-800">{success}</p> : null}
      </form>

      {summary.entries.length > 0 ? (
        <div className="mt-6 border-t border-[var(--ep-border)] pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Recent entries</h3>
          <ul className="mt-2 divide-y divide-[var(--ep-border)]">
            {summary.entries.slice(0, 15).map((e) => (
              <li key={e.id} className="py-2 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-mono text-xs font-bold tracking-widest text-[var(--ep-gold)]">
                    {e.operatorInitials}
                  </span>
                  <span className="font-medium text-[var(--ep-navy)]">{e.label}</span>
                  {e.quantity > 1 ? (
                    <span className="text-xs text-[var(--ep-navy-muted)]">×{e.quantity}</span>
                  ) : null}
                  <span className="rounded bg-[var(--ep-cream)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--ep-navy-muted)]">
                    {e.category.replace("_", " ")}
                  </span>
                </div>
                {e.description ? (
                  <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{e.description}</p>
                ) : null}
                <p className="mt-0.5 text-[10px] text-[var(--ep-navy-muted)]">{formatWhen(e.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
