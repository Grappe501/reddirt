import Link from "next/link";
import { notFound } from "next/navigation";
import { POSITION_TREE, type PositionId } from "@/lib/campaign-engine/positions";
import {
  getHighPriorityInboxItemsForPosition,
  getInboxForPosition,
  getPositionInboxConfigOrNull,
  getWorkbenchSummaryForPosition,
} from "@/lib/campaign-engine/position-inbox";
import { getSeatInboxWorkAlignment, getSeatAssignmentContext } from "@/lib/campaign-engine/open-work";
import { getPositionWorkbenchSeatContext } from "@/lib/campaign-engine/seating";

const VALID = new Set(POSITION_TREE.map((p) => p.id));

type Props = { params: Promise<{ positionId: string }> };

export default async function PositionWorkbenchDetailPage({ params }: Props) {
  const { positionId: raw } = await params;
  const positionId = raw as PositionId;
  if (!VALID.has(positionId)) notFound();

  const [inbox, seat, align, saCtx] = await Promise.all([
    getInboxForPosition(positionId, { limitPerSource: 15, maxTotal: 40 }),
    getPositionWorkbenchSeatContext(positionId),
    getSeatInboxWorkAlignment(positionId, { limitPerSource: 15, maxTotal: 40 }),
    getSeatAssignmentContext(positionId),
  ]);
  const summary = getWorkbenchSummaryForPosition(positionId, { itemCount: inbox.length });
  const high = getHighPriorityInboxItemsForPosition(inbox, 8);
  const cfg = getPositionInboxConfigOrNull(positionId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link href="/admin/workbench/positions" className="text-sm text-kelly-slate hover:underline">
          ← All positions
        </Link>
        <Link href="/admin/workbench" className="ml-3 text-sm text-kelly-slate hover:underline">
          Workbench
        </Link>
        <Link href="/admin/workbench/seats" className="ml-3 text-sm text-kelly-slate hover:underline">
          Seats
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">{summary.displayName}</h1>
        <p className="mt-1 text-[11px] text-kelly-text/55">Position id: {summary.positionId}</p>
        {summary.parent ? (
          <p className="mt-1 text-sm text-kelly-text/70">
            Reports to: <span className="font-medium text-kelly-text">{summary.parent.displayName}</span> (
            {summary.parent.id})
          </p>
        ) : (
          <p className="mt-1 text-sm text-kelly-text/70">Root role (no parent in tree).</p>
        )}
        <p className="mt-2 text-sm text-kelly-text/75">
          <span className="font-semibold">Inbox support:</span> {summary.supportLevel}
          {cfg ? ` — ${cfg.heuristicNote}` : " — no v1 heuristics; linked tools below."}
        </p>
        <section className="mt-3 rounded border border-kelly-text/15 bg-kelly-muted/10 p-3 text-sm text-kelly-text/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Seat (SEAT-1) · occupancy</p>
          <p className="mt-1">
            {seat.displayUser ? (
              <>
                <span className="font-medium">Occupied by:</span> {seat.displayUser.name ?? seat.displayUser.email} (
                {seat.displayUser.email}) · status {seat.effectiveStatus}
                {seat.actingForPositionKey ? ` · acting for ${seat.actingForPositionKey}` : null}
              </>
            ) : (
              <>
                <span className="font-medium">Vacant</span>
                {seat.hasRecord ? " — seat row exists without user." : " — no PositionSeat row yet (treated as vacant)."} {" "}
                {saCtx.inheritedAttentionToPositionId ? (
                  <>
                    Structural roll-up: attention inherits to{" "}
                    <span className="font-medium">{saCtx.inheritedAttentionToDisplayName ?? "parent role"}</span> (
                    <span className="font-mono">{saCtx.inheritedAttentionToPositionId}</span>) — not automatic queue
                    routing.
                  </>
                ) : (
                  "Root role — no parent roll-up."
                )}
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-kelly-text/55">
            Staffing only; assign in{" "}
            <Link href="/admin/workbench/seats" className="font-semibold text-kelly-slate hover:underline">
              Position seats
            </Link>
            . UWR-1 domain rows use user assignee fields only (no position column on work objects in ASSIGN-2).
          </p>
        </section>

        <section className="mt-2 rounded border border-slate-300/30 bg-kelly-page/80 p-3 text-sm text-kelly-text/85">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">ASSIGN-2 — seat vs assignment (read-only)</p>
          <p className="mt-1 text-xs text-kelly-text/60">
            Compares the position&apos;s v1 heuristic slice to the seat occupant. Mismatch = assigned user on a row
            other than the current occupant — signal only, no auto-rebind.
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-kelly-text/80">
            <li>
              Slice rows: {align.positionInboxTotal} · to occupant: {align.sliceAssignedToOccupant} · to other user:{" "}
              {align.sliceAssignedToOtherUser} · unassigned: {align.sliceUnassigned}
            </li>
            <li>
              All assigned in slice match occupant:{" "}
              {align.allAssignedInSliceMatchOccupant == null
                ? "n/a (no occupant or no assignee rows in slice)"
                : align.allAssignedInSliceMatchOccupant
                  ? "yes"
                  : "no — review manually"}
            </li>
            <li>
              Occupant&apos;s <strong>global</strong> open work (all UWR-1 sources, not only this slice):{" "}
              {align.occupantUserId ? align.occupantOpenWorkGlobalCount : "— (vacant)"}
            </li>
          </ul>
        </section>
      </div>

      {high.length > 0 ? (
        <section className="rounded-card border border-amber-200/50 bg-amber-50/40 p-4">
          <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-amber-950/80">
            High-priority / escalated (read-only slice)
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {high.map((row) => (
              <li key={`${row.source}-${row.id}`}>
                <Link href={row.href} className="font-medium text-kelly-slate hover:underline">
                  {row.summaryLine}
                </Link>
                {row.escalationLabel ? (
                  <span className="ml-1 text-xs text-amber-900">· {row.escalationLabel}</span>
                ) : null}
                <span className="ml-1 text-xs text-kelly-text/45">· {row.statusLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Open work (v1 UWR-1)</h2>
        {inbox.length === 0 ? (
          <p className="mt-2 text-sm text-kelly-text/60">
            No rows in this position&apos;s v1 heuristics, or no open items right now. Other tools may still have work.
          </p>
        ) : (
          <ul className="mt-2 max-h-80 space-y-1.5 overflow-y-auto text-sm">
            {inbox.map((row) => (
              <li
                key={`${row.source}-${row.id}`}
                className="border-b border-kelly-text/5 pb-1.5 last:border-0"
              >
                <span className="text-[10px] font-semibold uppercase text-kelly-text/45">{row.source}</span>{" "}
                <Link href={row.href} className="font-medium text-kelly-slate hover:underline">
                  {row.summaryLine}
                </Link>
                <span className="text-xs text-kelly-text/45"> · {row.statusLabel}</span>
                <a
                  href={row.workbenchRouteHint}
                  className="ml-2 text-[10px] font-semibold text-kelly-slate hover:underline"
                >
                  Workbench
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Linked tools</h2>
        {summary.includedDestinations.length === 0 ? (
          <p className="mt-1 text-sm text-kelly-text/60">No route hints in `POSITION_TREE` for this seat yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {summary.includedDestinations.map((href) => (
              <li key={href}>
                <a
                  href={href}
                  className="rounded border border-kelly-muted/30 bg-kelly-muted/10 px-2 py-1 text-xs font-semibold text-kelly-slate hover:border-kelly-text/25"
                >
                  {href}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border border-dashed border-kelly-text/20 p-3 text-[11px] text-kelly-text/55">
        <p className="font-semibold text-kelly-text/70">Guidance, training, AI</p>
        <p className="mt-1">
          Placeholder for future TALENT / ALIGN-1 / BRAIN-1 content. WB-CORE-1 does not load models or show hidden scores.
        </p>
      </section>
    </div>
  );
}
