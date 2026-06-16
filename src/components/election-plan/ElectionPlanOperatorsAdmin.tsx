"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Operator = {
  id: string;
  initials: string;
  displayName: string;
  email: string | null;
  countySlug: string | null;
  capabilities: string[];
  active: boolean;
};

export function ElectionPlanOperatorsAdmin() {
  const router = useRouter();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [initials, setInitials] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countySlug, setCountySlug] = useState("");
  const [countyScope, setCountyScope] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/election-plan/operators");
    if (!res.ok) return;
    const data = (await res.json()) as { operators: Operator[]; current: { capabilities: string[] } | null };
    setOperators(data.operators ?? []);
    setCanManage(Boolean(data.current?.capabilities.includes("manage_operators")));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setOk(null);
      const caps = ["field_entry"];
      if (countyScope && countySlug.trim()) caps.push("county_scope");
      const res = await fetch("/api/election-plan/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initials,
          displayName,
          countySlug: countyScope ? countySlug.trim().toLowerCase() : null,
          capabilities: caps,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }
      setOk(`Added ${initials.toUpperCase()}`);
      setInitials("");
      setDisplayName("");
      setCountySlug("");
      await load();
      router.refresh();
    },
    [initials, displayName, countySlug, countyScope, load, router],
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Approved operators ({operators.length})</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Only initials on this list can sign in and log field results. Each database row is prefixed with the operator
          initials.
        </p>
        <ul className="mt-4 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
          {operators.map((op) => (
            <li key={op.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <span className="font-mono text-base font-bold tracking-widest text-[var(--ep-navy)]">{op.initials}</span>
                <span className="ml-2 font-medium">{op.displayName}</span>
                {op.countySlug ? (
                  <span className="ml-2 text-xs text-[var(--ep-navy-muted)]">· {op.countySlug} county scope</span>
                ) : null}
              </div>
              <span className={`text-xs ${op.active ? "text-emerald-700" : "text-red-600"}`}>
                {op.active ? "active" : "inactive"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {canManage ? (
        <section className="ep-card">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Add operator</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Initials (3 letters)</span>
                <input
                  required
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded border px-2 py-2 font-mono uppercase tracking-widest"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Display name</span>
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded border px-2 py-2"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={countyScope} onChange={(e) => setCountyScope(e.target.checked)} />
              Limit to one county (county captains)
            </label>
            {countyScope ? (
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">County slug</span>
                <input
                  value={countySlug}
                  onChange={(e) => setCountySlug(e.target.value)}
                  placeholder="pulaski"
                  className="mt-1 w-full rounded border px-2 py-2"
                />
              </label>
            ) : null}
            <button type="submit" className="rounded bg-[var(--ep-navy)] px-4 py-2 text-sm font-bold text-white">
              Add to whitelist
            </button>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {ok ? <p className="text-sm text-emerald-800">{ok}</p> : null}
          </form>
        </section>
      ) : (
        <p className="text-sm text-[var(--ep-navy-muted)]">
          Sign in with an operator account that has <code>manage_operators</code> to add county captains. Seeded: KGR,
          SGR, ERN.
        </p>
      )}
    </div>
  );
}
