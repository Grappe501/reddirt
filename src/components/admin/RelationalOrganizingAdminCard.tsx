import Link from "next/link";
import type { RelationalOrganizingLinkForVoter } from "@/lib/campaign-engine/voter-relational-organizing";

type Row = RelationalOrganizingLinkForVoter;

type Props = {
  row: Row;
  /** When true, link to the REL-2 admin detail (for voter model page). */
  showRelationalContactLink?: boolean;
};

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString();
}

/**
 * Admin-only summary: relational / Power of 5 operational context.
 * Do not render on public routes.
 */
export function RelationalOrganizingAdminCard({ row, showRelationalContactLink }: Props) {
  return (
    <div className="rounded-card border border-kelly-text/10 bg-kelly-page/90 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-base font-bold text-kelly-text">Relational organizing</h3>
        {showRelationalContactLink ? (
          <Link
            className="text-xs font-semibold text-kelly-navy underline-offset-2 hover:underline"
            href={`/admin/relational-contacts/${row.relationalContactId}`}
          >
            Open REL-2 record →
          </Link>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-kelly-text/50">
        Admin-only fields. Organizer identity and pipeline stages are not shown on public pages.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Who invited them</dt>
          <dd className="mt-0.5 text-kelly-text/90">
            <span className="font-medium text-kelly-text">{row.invitedBy.label}</span>
            <span className="ml-2 font-mono text-[11px] text-kelly-text/45">user {row.invitedBy.userId.slice(0, 8)}…</span>
          </dd>
          <p className="mt-1 text-xs text-kelly-text/55">
            Volunteer who owns this REL-2 row (brought the contact into the relational network).
          </p>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Team assignment</dt>
          <dd className="mt-0.5 text-kelly-text/90">{row.teamAssignment ?? "— (no field unit)"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Pipeline stage</dt>
          <dd className="mt-0.5 font-medium text-kelly-text">{row.pipelineStage}</dd>
          <p className="mt-0.5 font-mono text-[10px] text-kelly-text/40">{row.organizingStatusRaw}</p>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Activity</dt>
          <dd className="mt-0.5 space-y-1 text-kelly-text/90">
            <p>
              <span className="text-kelly-text/55">Last contacted: </span>
              {fmtDate(row.activity.lastContactedAt)}
            </p>
            <p>
              <span className="text-kelly-text/55">Next follow-up: </span>
              {fmtDate(row.activity.nextFollowUpAt)}
            </p>
            <p>
              <span className="text-kelly-text/55">Logged touches (REL-linked): </span>
              {row.activity.loggedTouchCount}
            </p>
            {row.activity.latestTouch ? (
              <p className="text-xs text-kelly-text/75">
                Latest: {row.activity.latestTouch.interactionType} · {row.activity.latestTouch.interactionChannel} ·{" "}
                {row.activity.latestTouch.interactionDate.toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-kelly-text/55">No REL-linked interactions yet.</p>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2 border-t border-kelly-text/10 pt-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Power of 5</dt>
          <dd className="mt-0.5 text-kelly-text/90">
            Core five: {row.powerOfFive.isCoreFive ? "yes" : "no"}
            {row.powerOfFive.slot != null ? ` · slot ${row.powerOfFive.slot}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
