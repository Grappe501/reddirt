import Link from "next/link";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { COMMS_APP_PATHS, commsPlanPath } from "@/lib/comms-workbench/comms-nav";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import type { CommunicationPlanListItem } from "@/lib/comms-workbench/dto";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";
import {
  COMMUNICATION_OBJECTIVES,
  COMMUNICATION_PLAN_STATUSES,
} from "@/lib/comms-workbench/constants";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const th = "border-b border-kelly-text/10 px-2 py-1.5 text-left font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const td = "border-b border-kelly-text/5 px-2 py-2 align-top text-sm";

/** Merge filter keys; pass `null` in overrides to remove a key from the query string. */
function buildPlansHref(overrides: Record<string, string | null | undefined>, base: Record<string, string | undefined>) {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    if (v) m[k] = v;
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null || v === undefined || v === "") delete m[k];
    else m[k] = v;
  }
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(m)) {
    if (v) u.set(k, v);
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export function CommunicationPlanListToolbar({
  baseQuery,
}: {
  baseQuery: Record<string, string | undefined>;
}) {
  const b = baseQuery;
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div>
        <p className={h2}>Status</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Link
            href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ status: null }, b)}`}
            className="rounded border border-kelly-text/12 bg-white px-2 py-0.5 text-[11px] font-medium text-kelly-slate hover:border-kelly-text/25"
          >
            Any
          </Link>
          {COMMUNICATION_PLAN_STATUSES.map((st) => (
            <Link
              key={st}
              href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ status: st }, b)}`}
              className="rounded border border-kelly-text/12 bg-kelly-page px-2 py-0.5 text-[11px] font-medium text-kelly-text/80 hover:border-kelly-slate/30"
            >
              {formatCommsFieldLabel(st)}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <p className={h2}>Objective</p>
        <div className="mt-1 flex max-w-full flex-wrap gap-1">
          <Link
            href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ objective: null }, b)}`}
            className="rounded border border-kelly-text/12 bg-white px-2 py-0.5 text-[11px] font-medium text-kelly-slate"
          >
            Any
          </Link>
          {COMMUNICATION_OBJECTIVES.map((ob) => (
            <Link
              key={ob}
              href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ objective: ob }, b)}`}
              className="rounded border border-kelly-text/12 bg-kelly-page px-2 py-0.5 text-[11px] font-medium text-kelly-text/80 hover:border-kelly-slate/30"
            >
              {formatCommsFieldLabel(ob)}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <p className={h2}>Sort</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Link
            href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ sort: null }, b)}`}
            className="rounded border border-kelly-text/12 bg-white px-2 py-0.5 text-[11px] font-medium text-kelly-slate"
          >
            Updated ↓
          </Link>
          <Link
            href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ sort: "updated_asc" }, b)}`}
            className="rounded border border-kelly-text/12 px-2 py-0.5 text-[11px]"
          >
            Updated ↑
          </Link>
          <Link
            href={`${COMMS_APP_PATHS.plans}${buildPlansHref({ sort: "scheduled_asc" }, b)}`}
            className="rounded border border-kelly-text/12 px-2 py-0.5 text-[11px]"
          >
            Scheduled ↑
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CommunicationPlanListTable({ items }: { items: CommunicationPlanListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded border border-dashed border-kelly-text/20 bg-kelly-page/50 px-4 py-8 text-center font-body text-sm text-kelly-text/65">
        {COMMS_EMPTY.noPlans}{" "}
        <Link className="font-semibold text-kelly-slate" href={COMMS_APP_PATHS.plansNew}>
          New message plan
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-kelly-text/10 bg-white">
      <table className="w-full min-w-[720px] border-collapse text-kelly-text">
        <thead>
          <tr>
            <th className={th}>Plan</th>
            <th className={th}>Objective</th>
            <th className={th}>Status</th>
            <th className={th}>Priority</th>
            <th className={th}>Owner</th>
            <th className={th}>Counts · send health</th>
            <th className={th}>Review</th>
            <th className={th}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr
              key={p.id}
              className={
                p.sendRollup.failedCount > 0
                  ? "hover:bg-rose-50/30 bg-rose-50/20"
                  : p.sendRollup.queuedCount > 0 || p.sendRollup.sendingCount > 0
                    ? "hover:bg-amber-50/30 bg-amber-50/15"
                    : "hover:bg-kelly-page/40"
              }
            >
              <td className={td}>
                <Link href={commsPlanPath(p.id)} className="font-semibold text-kelly-slate hover:underline">
                  {p.title}
                </Link>
                {p.source.primary ? (
                  <p className="mt-0.5 text-[10px] text-kelly-text/55">
                    Source: {p.source.primary.sourceLabel}
                    {p.source.all.length > 1 ? ` (+${p.source.all.length - 1})` : ""}
                  </p>
                ) : null}
              </td>
              <td className={`${td} text-xs`}>{formatCommsFieldLabel(p.objective)}</td>
              <td className={`${td} text-xs`}>
                <CommsStatusBadge segment="plan" status={p.status} />
              </td>
              <td className={`${td} text-xs`}>{formatCommsFieldLabel(p.priority)}</td>
              <td className={`${td} text-xs`}>
                {p.owner?.nameLabel ?? p.owner?.email ?? "—"}
                {p.requester ? (
                  <span className="block text-[10px] text-kelly-text/45">Req: {p.requester.nameLabel ?? p.requester.email}</span>
                ) : null}
              </td>
              <td className={`${td} font-mono text-[11px]`}>
                D {p.draftCount} · V {p.variantCount} · S {p.sendCount}
                {p.sendCount > 0 ? (
                  <span className="mt-0.5 block text-kelly-text/70" title="Queued for send / sent / failed / sending (tracked sends)">
                    Queued {p.sendRollup.queuedCount} · sent {p.sendRollup.sentCount}
                    {p.sendRollup.failedCount > 0 ? (
                      <span className="ml-1 font-semibold text-rose-800">· failed {p.sendRollup.failedCount}</span>
                    ) : null}
                    {p.sendRollup.sendingCount > 0 ? (
                      <span className="ml-1 text-amber-900">· sending {p.sendRollup.sendingCount}</span>
                    ) : null}
                  </span>
                ) : null}
              </td>
              <td className={`${td} text-[11px]`}>
                {p.review.hasDraftsReadyForReview || p.review.hasVariantsReadyForReview ? (
                  <span className="font-semibold text-amber-800">Ready for review</span>
                ) : (
                  "—"
                )}
                <span className="block text-kelly-text/50">
                  D ✓{p.review.approvedDraftCount} · ✗{p.review.rejectedDraftCount}
                </span>
                <span className="block text-kelly-text/50">
                  V ✓{p.review.approvedVariantCount} · ✗{p.review.rejectedVariantCount}
                </span>
              </td>
              <td className={`${td} text-[10px] text-kelly-text/60`}>
                <time dateTime={p.updatedAt}>{new Date(p.updatedAt).toLocaleString()}</time>
                {p.scheduledAt ? (
                  <span className="mt-0.5 block">Sched: {new Date(p.scheduledAt).toLocaleString()}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Flatten `searchParams` to single string values for filter toolbar continuity. */
export function flattenSearchParams(
  sp: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    out[k] = Array.isArray(v) ? v[0] : v;
  }
  return out;
}
