"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { LeaderRosterPersonRow, LeaderRosterSnapshot } from "@/lib/volunteers/leader-roster-db";

const STATUSES = ["open", "mapped", "contacted", "invited", "committed"] as const;

type Props = {
  leaderInitials: string;
  roster: LeaderRosterSnapshot;
  editable: boolean;
};

function statusLabel(status: string): string {
  return status.replace("_", " ");
}

export function LeaderRosterWorkbenchPanels({ leaderInitials, roster, editable }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const refresh = useCallback(() => router.refresh(), [router]);

  const patchPerson = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/election-plan/leaders/roster", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, leaderInitials, ...patch }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
        refresh();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [leaderInitials, refresh],
  );

  const addTeamMember = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const displayName = String(fd.get("displayName") ?? "").trim();
      const category = String(fd.get("category") ?? "").trim();
      if (!displayName) return;

      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/election-plan/leaders/roster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaderInitials,
            layer: "team",
            displayName,
            category: category || null,
            status: "mapped",
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Add failed");
          return;
        }
        e.currentTarget.reset();
        refresh();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [leaderInitials, refresh],
  );

  const addBranch = useCallback(
    async (parentId: string, displayName: string, category: string) => {
      if (!displayName.trim()) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/election-plan/leaders/roster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaderInitials,
            layer: "branch",
            parentId,
            displayName: displayName.trim(),
            category: category.trim() || null,
            status: "mapped",
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Add branch failed");
          return;
        }
        refresh();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [leaderInitials, refresh],
  );

  const removePerson = useCallback(
    async (id: string) => {
      setBusy(true);
      setError(null);
      try {
        const params = new URLSearchParams({ id, leaderInitials });
        const res = await fetch(`/api/election-plan/leaders/roster?${params}`, { method: "DELETE" });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Remove failed");
          return;
        }
        refresh();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [leaderInitials, refresh],
  );

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Power of 5 · My Five</p>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Map five people you already trust, then grow branches under each — one conversation becomes five, then
          twenty-five.
        </p>
        <p className="mt-2 text-sm text-[var(--ep-navy)]">
          <strong>{roster.stats.myFiveFilled} / 5</strong> mapped · <strong>{roster.stats.branchCount}</strong> branch
          contacts · <strong>{roster.stats.committedCount}</strong> committed
        </p>
      </div>

      <ul className="space-y-4">
        {roster.myFive.map((slot) => (
          <MyFiveSlotCard
            key={slot.id}
            slot={slot}
            branches={roster.branchesByParentId[slot.id] ?? []}
            editable={editable}
            busy={busy}
            expanded={expandedParent === slot.id}
            onToggle={() => setExpandedParent((p) => (p === slot.id ? null : slot.id))}
            onPatch={patchPerson}
            onRemove={removePerson}
            onAddBranch={addBranch}
          />
        ))}
      </ul>

      <section id="team-roster">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Your team</h3>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Deputies, co-leads, and helpers beyond your My Five — people who share the load in your county or lane.
        </p>

        {editable ? (
          <form onSubmit={addTeamMember} className="mt-4 flex flex-wrap gap-2">
            <input
              name="displayName"
              required
              maxLength={120}
              placeholder="Name"
              className="min-w-[10rem] flex-1 rounded-md border border-[var(--ep-border)] px-3 py-2 text-sm"
            />
            <input
              name="category"
              maxLength={80}
              placeholder="Role (e.g. Events co-lead)"
              className="min-w-[10rem] flex-1 rounded-md border border-[var(--ep-border)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-[var(--ep-navy)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Add to team
            </button>
          </form>
        ) : null}

        <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white">
          {roster.team.length ? (
            roster.team.map((member) => (
              <TeamRow
                key={member.id}
                member={member}
                editable={editable}
                busy={busy}
                onPatch={patchPerson}
                onRemove={removePerson}
              />
            ))
          ) : (
            <li className="px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
              No team members yet — add deputies and co-leads who help you run your lane.
            </li>
          )}
        </ul>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function MyFiveSlotCard({
  slot,
  branches,
  editable,
  busy,
  expanded,
  onToggle,
  onPatch,
  onRemove,
  onAddBranch,
}: {
  slot: LeaderRosterPersonRow;
  branches: LeaderRosterPersonRow[];
  editable: boolean;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onAddBranch: (parentId: string, name: string, category: string) => void;
}) {
  const isOpen = slot.status === "open" || slot.displayName === "Open slot";
  const [name, setName] = useState(isOpen ? "" : slot.displayName);
  const [category, setCategory] = useState(slot.category ?? "");
  const [status, setStatus] = useState(slot.status);
  const [branchName, setBranchName] = useState("");
  const [branchCategory, setBranchCategory] = useState("");

  return (
    <li className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">
            Slot {slot.slotIndex ?? "?"}
          </p>
          {editable ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
              >
                {STATUSES.filter((s) => s !== "open" || isOpen).map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <p className="mt-1 font-semibold text-[var(--ep-navy)]">{slot.displayName}</p>
              <p className="text-xs text-[var(--ep-navy-muted)]">{slot.category ?? "—"}</p>
            </>
          )}
        </div>
        <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs font-semibold uppercase text-[var(--ep-navy)]">
          {slot.status}
        </span>
      </div>

      {editable ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() =>
              onPatch(slot.id, {
                displayName: name.trim(),
                category: category.trim() || null,
                status: status === "open" && name.trim() ? "mapped" : status,
              })
            }
            className="ep-btn ep-btn-primary ep-btn-sm"
          >
            Save slot
          </button>
          {!isOpen ? (
            <button type="button" disabled={busy} onClick={() => onRemove(slot.id)} className="ep-btn ep-btn-ghost ep-btn-sm">
              Clear slot
            </button>
          ) : null}
          <button type="button" onClick={onToggle} className="ep-btn ep-btn-ghost ep-btn-sm">
            {expanded ? "Hide branches" : `Branches (${branches.length}/5)`}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{branches.length} branch contacts</p>
      )}

      {expanded ? (
        <div className="mt-4 border-t border-[var(--ep-navy)]/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Branch contacts</p>
          <ul className="mt-2 space-y-2">
            {branches.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--ep-cream)]/50 px-3 py-2 text-sm">
                <span>
                  <strong>{b.displayName}</strong>
                  {b.category ? <span className="text-[var(--ep-navy-muted)]"> · {b.category}</span> : null}
                </span>
                {editable ? (
                  <button type="button" disabled={busy} onClick={() => onRemove(b.id)} className="text-xs text-red-700">
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {editable && branches.length < 5 && !isOpen ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch contact name"
                className="min-w-[8rem] flex-1 rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
              />
              <input
                value={branchCategory}
                onChange={(e) => setBranchCategory(e.target.value)}
                placeholder="Relationship"
                className="min-w-[8rem] flex-1 rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={busy || !branchName.trim()}
                onClick={() => {
                  onAddBranch(slot.id, branchName, branchCategory);
                  setBranchName("");
                  setBranchCategory("");
                }}
                className="ep-btn ep-btn-ghost ep-btn-sm"
              >
                Add branch
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function TeamRow({
  member,
  editable,
  busy,
  onPatch,
  onRemove,
}: {
  member: LeaderRosterPersonRow;
  editable: boolean;
  busy: boolean;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState(member.displayName);
  const [category, setCategory] = useState(member.category ?? "");
  const [status, setStatus] = useState(member.status);

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
      {editable ? (
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[8rem] flex-1 rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Role"
            className="min-w-[8rem] flex-1 rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-md border border-[var(--ep-border)] px-2 py-1.5 text-sm"
          >
            {STATUSES.filter((s) => s !== "open").map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              onPatch(member.id, {
                displayName: name.trim(),
                category: category.trim() || null,
                status,
              })
            }
            className="text-xs font-semibold text-[var(--ep-blue)]"
          >
            Save
          </button>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-[var(--ep-navy)]">{member.displayName}</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">{member.category ?? "Team"}</p>
        </div>
      )}
      {editable ? (
        <button type="button" disabled={busy} onClick={() => onRemove(member.id)} className="text-xs text-red-700">
          Remove
        </button>
      ) : (
        <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs uppercase">{member.status}</span>
      )}
    </li>
  );
}
