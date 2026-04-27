import Link from "next/link";

import {
  buildGotvContactPlanPreview,
  buildGotvContactPlanReview,
  formatGotvContactPlanReviewAsCsv,
} from "@/lib/campaign-engine/gotv-contact-plan";
import {
  getGotvPriorityUniverse,
  getGotvSummary,
  GotvPriorityReason,
} from "@/lib/campaign-engine/gotv-read-model";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  [GotvPriorityReason.HAS_RELATIONAL_CONNECTION]: "Has relational connection",
  [GotvPriorityReason.RECENT_INTERACTION]: "Has recent interaction",
  [GotvPriorityReason.NO_RECENT_IN_TARGET_GEOGRAPHY]: "No recent interaction in target geography",
  [GotvPriorityReason.MISSING_CONTACT_HISTORY]: "Missing contact history",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminGotvPage({ searchParams }: Props) {
  const sp = await searchParams;
  const countyId = typeof sp.countyId === "string" && sp.countyId ? sp.countyId : undefined;
  const precinct = typeof sp.precinct === "string" && sp.precinct ? sp.precinct : undefined;
  const fieldUnitId =
    typeof sp.fieldUnitId === "string" && sp.fieldUnitId ? sp.fieldUnitId : undefined;

  const scope = { countyId, precinct, fieldUnitId };

  const [summary, rows, planPreview, planReview, counties, fieldUnits] = await Promise.all([
    getGotvSummary(scope),
    getGotvPriorityUniverse({ ...scope, limit: 150, offset: 0 }),
    buildGotvContactPlanPreview(scope),
    buildGotvContactPlanReview({ ...scope, limit: 450, maxRowsPerBucket: 50 }),
    prisma.county.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, displayName: true, slug: true },
    }),
    prisma.fieldUnit.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, type: true } }),
  ]);

  const contactPlanCsvPreview = formatGotvContactPlanReviewAsCsv(planReview);

  const filterQs = new URLSearchParams();
  if (countyId) {
    filterQs.set("countyId", countyId);
  }
  if (precinct) {
    filterQs.set("precinct", precinct);
  }
  if (fieldUnitId) {
    filterQs.set("fieldUnitId", fieldUnitId);
  }
  const qs = filterQs.toString();
  const formAction = qs ? `?${qs}` : "";

  return (
    <div className="max-w-6xl text-kelly-text">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">
        Field / turnout · GOTV-1 + GOTV-2
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">GOTV priority (read-only)</h1>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/70">
        Operational view from the voter file, relational links, and logged interactions.{" "}
        <strong>No</strong> vote prediction, <strong>no</strong> automated outreach, <strong>no</strong> support
        scores. Relational contacts are people in the organizing graph — not vote totals.
      </p>

      <div
        className="mt-6 rounded-lg border border-amber-700/25 bg-amber-50/90 px-4 py-3 text-sm text-kelly-text/90"
        role="note"
      >
        <p className="text-amber-900">
          <strong>This is review-only.</strong> It does not send messages, assign voters, or predict support.
        </p>
        <p className="mt-2 text-kelly-text/85">
          Contact-plan buckets use explainable rules from stored relational and interaction rows only (no support scores
          or hidden ranking).
        </p>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">County</span>
          <select
            name="countyId"
            defaultValue={countyId ?? ""}
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
          >
            <option value="">All published counties</option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName} ({c.slug})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Precinct (exact)</span>
          <input
            name="precinct"
            type="text"
            defaultValue={precinct ?? ""}
            placeholder="Optional"
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Field unit</span>
          <select
            name="fieldUnitId"
            defaultValue={fieldUnitId ?? ""}
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
          >
            <option value="">All (not filtered by field unit)</option>
            {fieldUnits.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.type}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-md bg-kelly-text px-4 py-2 font-body text-sm font-semibold text-kelly-page"
          >
            Apply filters
          </button>
          <Link
            href="/admin/gotv"
            className="rounded-md border border-kelly-text/20 px-4 py-2 font-body text-sm text-kelly-text/80"
          >
            Clear
          </Link>
        </div>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Voters in scope</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.totalVotersInScope}</p>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">With relational link</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.votersWithRelationalConnection}</p>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Recent interaction</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.votersWithRecentInteraction}</p>
          <p className="mt-1 text-xs text-kelly-text/55">
            Window: {summary.recentInteractionDays} days (rolling)
          </p>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Without recent interaction</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.votersWithoutRecentInteraction}</p>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Total interactions (scope)</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.totalInteractions}</p>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Last interaction (scope)</p>
          <p className="mt-1 font-mono text-sm">
            {summary.lastInteractionAt
              ? summary.lastInteractionAt.toISOString().slice(0, 10)
              : "—"}
          </p>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="gotv-contact-plan-review-heading">
        <h2 id="gotv-contact-plan-review-heading" className="font-heading text-xl font-bold">
          Contact Plan Review
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-kelly-text/50">GOTV-2</p>
        <p className="mt-1 text-sm text-kelly-text/65">
          Mutually exclusive buckets for operator preview. Counts cover the full filtered universe; tables sample up to
          50 rows per bucket from the first 450 voters loaded (sorted by county + voter key).
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/55">
          {planReview.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planReview.buckets.map((b) => (
            <div key={b.key} className="rounded-card border border-kelly-text/10 bg-kelly-page p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">{b.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{b.count}</p>
              <p className="mt-1 text-xs text-kelly-text/60">{b.description}</p>
              <p className="mt-2 font-mono text-[10px] text-kelly-text/45">{b.key}</p>
            </div>
          ))}
        </div>

        <details className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page/50 p-4 open:bg-kelly-page">
          <summary className="cursor-pointer font-body text-sm font-semibold text-kelly-text">
            CSV preview (read-only, copy to clipboard) — {contactPlanCsvPreview.split("\n").length - 1} data rows
          </summary>
          <p className="mt-2 text-xs text-kelly-text/60">
            Same rows as the tables below, one line per row; includes bucket and semicolon-joined reason codes. No
            server export, no queue, no assignment.
          </p>
          <pre className="mt-3 max-h-80 overflow-auto rounded border border-kelly-text/10 bg-white/80 p-3 font-mono text-[11px] leading-relaxed text-kelly-text/90 [overflow-wrap:anywhere]">
            {contactPlanCsvPreview}
          </pre>
        </details>

        {planReview.buckets.map((b) => (
          <div key={`table-${b.key}`} className="mt-8">
            <h3 className="font-heading text-lg font-bold">
              {b.label}{" "}
              <span className="font-mono text-sm font-normal text-kelly-text/50">
                ({b.rows.length} shown / {b.count} in universe)
              </span>
            </h3>
            <div className="mt-3 overflow-x-auto rounded-card border border-kelly-text/10">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-kelly-text/10 bg-kelly-text/5">
                    <th className="px-3 py-2 font-semibold">Voter</th>
                    <th className="px-3 py-2 font-semibold">County</th>
                    <th className="px-3 py-2 font-semibold">Geography</th>
                    <th className="px-3 py-2 font-semibold">Rel.</th>
                    <th className="px-3 py-2 font-semibold">Ix</th>
                    <th className="px-3 py-2 font-semibold">Last ix</th>
                    <th className="px-3 py-2 font-semibold">Reasons</th>
                    <th className="px-3 py-2 font-semibold">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {b.rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-kelly-text/55">
                        No rows in this sample.
                      </td>
                    </tr>
                  ) : (
                    b.rows.map((r) => (
                      <tr key={`${b.key}-${r.voterRecordId}`} className="border-b border-kelly-text/5">
                        <td className="px-3 py-2 align-top">
                          <div className="font-mono text-xs text-kelly-text/70">{r.voterFileKey}</div>
                          <div>{r.voterName}</div>
                        </td>
                        <td className="px-3 py-2 align-top font-mono text-xs text-kelly-text/80">{r.countyId}</td>
                        <td className="px-3 py-2 align-top text-xs">
                          {r.countySlug}
                          {r.precinct ? ` · p${r.precinct}` : ""}
                          {r.city ? <span className="block text-kelly-text/70">{r.city}</span> : null}
                        </td>
                        <td className="px-3 py-2 align-top tabular-nums">{r.relationalContactCount}</td>
                        <td className="px-3 py-2 align-top tabular-nums">{r.interactionCount}</td>
                        <td className="px-3 py-2 align-top font-mono text-xs">
                          {r.lastInteractionAt
                            ? r.lastInteractionAt.toISOString().slice(0, 10)
                            : "—"}
                        </td>
                        <td className="px-3 py-2 align-top text-xs">
                          <ul className="list-inside list-disc text-kelly-text/80">
                            {r.priorityReason.map((code) => (
                              <li key={code}>{REASON_LABEL[code] ?? code}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-3 py-2 align-top text-xs">
                          <Link className="text-kelly-navy underline" href={`/admin/voters/${r.voterRecordId}/model`}>
                            Voter record
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold">Contact plan preview (GOTV-1 overlapping buckets)</h2>
        <p className="mt-1 text-sm text-kelly-text/65">
          Suggested buckets for discussion — {planPreview.notes[0]}
        </p>
        <ul className="mt-4 space-y-3">
          {planPreview.suggestedContactBuckets.map((b) => (
            <li
              key={b.key}
              className="flex flex-col gap-1 rounded-md border border-kelly-text/10 bg-kelly-page/80 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {b.label} <span className="font-mono text-xs text-kelly-text/50">({b.key})</span>
                </p>
                <p className="text-sm text-kelly-text/65">{b.description}</p>
              </div>
              <p className="font-heading text-2xl font-bold tabular-nums">{b.count}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold">Priority universe (up to 150 rows)</h2>
        <p className="mt-1 text-sm text-kelly-text/65">
          Sorted for operations: needs touch before recently contacted; then relational before cold.
        </p>
        <div className="mt-4 overflow-x-auto rounded-card border border-kelly-text/10">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-kelly-text/5">
                <th className="px-3 py-2 font-semibold">Voter</th>
                <th className="px-3 py-2 font-semibold">Geography</th>
                <th className="px-3 py-2 font-semibold">Rel.</th>
                <th className="px-3 py-2 font-semibold">Ix</th>
                <th className="px-3 py-2 font-semibold">Last ix</th>
                <th className="px-3 py-2 font-semibold">Reasons</th>
                <th className="px-3 py-2 font-semibold">Links</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-kelly-text/60">
                    No voters in this scope (try clearing filters or loading voter file + activity).
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.voterRecordId} className="border-b border-kelly-text/5">
                    <td className="px-3 py-2 align-top">
                      <div className="font-mono text-xs text-kelly-text/70">{r.voterFileKey}</div>
                      <div>
                        {[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      {r.countySlug}
                      {r.precinct ? ` · p${r.precinct}` : ""}
                      {r.city ? <span className="block text-kelly-text/70">{r.city}</span> : null}
                    </td>
                    <td className="px-3 py-2 align-top tabular-nums">{r.relationalContactCount}</td>
                    <td className="px-3 py-2 align-top tabular-nums">{r.interactionCount}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs">
                      {r.lastInteractionAt
                        ? r.lastInteractionAt.toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <ul className="list-inside list-disc text-kelly-text/80">
                        {r.priorityReason.map((code) => (
                          <li key={code}>{REASON_LABEL[code] ?? code}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <Link className="text-kelly-navy underline" href={`/admin/voters/${r.voterRecordId}/model`}>
                        Voter record
                      </Link>
                      {r.sampleRelationalContactId ? (
                        <>
                          <br />
                          <Link
                            className="text-kelly-navy underline"
                            href={`/admin/relational-contacts/${r.sampleRelationalContactId}`}
                          >
                            Relational contact
                          </Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {formAction ? (
          <p className="mt-3 text-xs text-kelly-text/55">
            Pagination not enabled on this view; reduce scope with filters. Query:{" "}
            <span className="font-mono">{formAction || "/admin/gotv"}</span>
          </p>
        ) : null}
      </section>

      <p className="mt-10 text-xs text-kelly-text/50">
        <strong>CSV</strong>: read-only preview is in Contact Plan Review above. A governed download or outbound sheet
        rail can ship with <strong>GOTV-3+</strong> if product requires it.
      </p>
    </div>
  );
}
