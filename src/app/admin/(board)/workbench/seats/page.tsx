import Link from "next/link";
import { listPositionSeats, getCoverageSummary, getVacantSeatsWithUnfilledSubtrees } from "@/lib/campaign-engine/seating";
import { prisma } from "@/lib/db";
import { setPositionSeatState } from "./actions";

const STATUS_OPTIONS = [
  { value: "FILLED", label: "Filled" },
  { value: "ACTING", label: "Acting" },
  { value: "SHADOW", label: "Shadow / trainee" },
] as const;

export default async function PositionSeatsPage() {
  const [seats, summary, userChoices] = await Promise.all([
    listPositionSeats(),
    getCoverageSummary(),
    prisma.user.findMany({
      take: 500,
      orderBy: { email: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);
  const riskyHoles = getVacantSeatsWithUnfilledSubtrees(seats);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <Link href="/admin/workbench" className="text-sm text-kelly-slate hover:underline">
          ← Workbench
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Position seats (SEAT-1)</h1>
        <p className="mt-2 text-sm text-kelly-text/75">
          Read-first coverage for ROLE-1 positions. Assignments are <strong>staffing metadata</strong> only — they do
          not grant permissions, re-route the unified work queue, or run automation. Empty DB row = vacant (untracked
          or never saved).
        </p>
      </div>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-4 text-sm text-kelly-text/85">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Summary</h2>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          <li>Total positions: {summary.totalPositions}</li>
          <li>Persisted seat rows: {summary.withDbRow}</li>
          <li>Vacant: {summary.vacant} · Filled: {summary.filled} · Acting: {summary.acting} · Shadow: {summary.shadow}</li>
          <li>Vacant under Campaign Manager: {summary.vacantUnderCampaignManager}</li>
        </ul>
        {riskyHoles.length > 0 ? (
          <p className="mt-2 text-amber-900/90">
            <span className="font-semibold">Heuristic “hole” (vacant with vacant child):</span>{" "}
            {riskyHoles.join(", ")}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-kelly-text/55">
          High-load and workload signals are <strong>not</strong> in SEAT-1. See <code>docs/delegation-and-coverage-foundation.md</code>
          / future packets.
        </p>
      </section>

      <div className="overflow-x-auto rounded-card border border-kelly-text/10">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-muted/20 text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">
              <th className="p-2">Position</th>
              <th className="p-2">Effective</th>
              <th className="p-2">User</th>
              <th className="p-2">Roll-up (parent)</th>
              <th className="p-2">Workbench</th>
              <th className="p-2">Set seat</th>
            </tr>
          </thead>
          <tbody>
            {seats.map((s) => (
              <tr key={s.position.id} className="border-b border-kelly-text/5">
                <td className="p-2 font-medium text-kelly-text">
                  {s.position.displayName}
                  <br />
                  <span className="text-[10px] text-kelly-text/45">{s.position.id}</span>
                </td>
                <td className="p-2 text-kelly-text/80">{s.effectiveStatus}</td>
                <td className="p-2 text-kelly-text/80">
                  {s.displayUser ? (
                    <span>
                      {s.displayUser.name ?? s.displayUser.email}
                      <br />
                      <span className="text-[10px] text-kelly-text/45">{s.displayUser.email}</span>
                    </span>
                  ) : (
                    <span className="text-kelly-text/50">—</span>
                  )}
                  {s.record?.status === "ACTING" && s.actingForPositionKey ? (
                    <span className="ml-1 block text-[10px] text-kelly-text/45">
                      acting for: {s.actingForPositionKey}
                    </span>
                  ) : null}
                </td>
                <td className="p-2 text-xs text-kelly-text/60">{s.rollUpTo ?? "—"}</td>
                <td className="p-2">
                  <a
                    href={`/admin/workbench/positions/${s.position.id}`}
                    className="text-xs font-semibold text-kelly-slate hover:underline"
                  >
                    Open
                  </a>
                </td>
                <td className="p-2 align-top">
                  <form action={setPositionSeatState} className="flex flex-col gap-1.5 text-xs">
                    <input type="hidden" name="positionKey" value={s.position.id} />
                    <label className="text-kelly-text/50">
                      User
                      <select
                        name="userId"
                        className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-0.5 text-kelly-text"
                        defaultValue={s.displayUser?.id ?? ""}
                      >
                        <option value="">(vacant)</option>
                        {userChoices.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email} {u.name ? `· ${u.name}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-kelly-text/50">
                      Status
                      <select
                        name="status"
                        className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-0.5 text-kelly-text"
                        defaultValue={
                          s.displayUser
                            ? s.effectiveStatus === "VACANT"
                              ? "FILLED"
                              : s.effectiveStatus
                            : "VACANT"
                        }
                      >
                        <option value="VACANT">Vacant (or clear user above)</option>
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-kelly-text/50">
                      Acting for (position id, if acting)
                      <input
                        name="actingForPositionKey"
                        className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-0.5 text-kelly-text"
                        placeholder="e.g. field_director"
                        defaultValue={s.actingForPositionKey ?? ""}
                      />
                    </label>
                    <button
                      type="submit"
                      className="mt-0.5 rounded border border-kelly-slate/40 bg-kelly-slate/10 px-2 py-1 text-[11px] font-semibold text-kelly-slate hover:bg-kelly-slate/20"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
