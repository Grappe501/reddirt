import Link from "next/link";

import {
  markVolunteerIntakeActivatedAction,
  markVolunteerIntakeAwaitingInfoAction,
  markVolunteerIntakeInReviewAction,
} from "@/app/election-plan/operators/volunteer-intake-actions";
import type {
  CoalitionIntakeQueueRow,
  CoalitionLaneDashboardPayload,
  CoalitionWorkbenchRow,
} from "@/lib/coalition/load-coalition-lane-dashboard";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  READY_FOR_CALENDAR: "Ready",
  CONVERTED: "Activated",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

function statusBadgeClass(status: string): string {
  if (status === "PENDING") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "IN_REVIEW" || status === "AWAITING_INFO") return "bg-sky-50 text-sky-950 ring-sky-200";
  if (status === "CONVERTED") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function readinessBadgeClass(band: CoalitionWorkbenchRow["readinessBand"]): string {
  if (band === "green") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  if (band === "yellow") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-red-50 text-red-950 ring-red-200";
}

type Props = {
  payload: CoalitionLaneDashboardPayload;
  selectedIntakeId?: string;
};

export function CoalitionLaneRollupDashboard({ payload, selectedIntakeId }: Props) {
  const selected = payload.coalitionIntake.find((r) => r.id === selectedIntakeId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured — relationship counts and intake queue depth need{" "}
            <code className="text-xs">DATABASE_URL</code>. Coalition workbench registry and readiness still load.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {payload.pipeline.map((step) => (
            <div key={step.stage} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{step.label}</p>
              <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{step.count}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ep-navy-muted)]">
          <p>
            Avg readiness:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.avgReadinessPct}%</span>
          </p>
          <p>
            Partner field log qty:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.partnerRelationships}</span>
          </p>
          <p>
            Coalition workbenches:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.coalitionWorkbenches}</span>
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly coalition rhythm</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {payload.weeklyRhythm.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                {item.href ? (
                  <Link href={item.href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {item.label} →
                  </Link>
                ) : (
                  <p className="font-semibold text-[var(--ep-navy)]">{item.label}</p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Coalition workbench rollup</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Twelve record-backed coalition surfaces — readiness, ownership, and partner relationships.
              </p>
            </div>
            <Link
              href="/election-plan/workbenches?kind=coalition"
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              All coalition workbenches →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Workbench</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Readiness</th>
                  <th className="px-4 py-3 font-semibold">Relationships</th>
                  <th className="px-4 py-3 font-semibold">Intel</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.workbenches.map((row) => (
                  <WorkbenchRow key={row.slug} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {payload.missingOwnerWorkbenches.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Missing community leads</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              Assign named coalition leads before scaling partner asks — local leaders shape each workbench.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {payload.missingOwnerWorkbenches.map((wb) => (
                <li key={wb.slug}>
                  <Link
                    href={wb.workbenchHref}
                    className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-950 hover:bg-red-100"
                  >
                    {wb.name} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Partner intake queue</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Website sign-ups with coalition, faith, labor, or leadership signals — placement on partner workbench.
              </p>
            </div>
            <Link
              href="/election-plan/operators/volunteer-intake"
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Full volunteer intake →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Signals</th>
                  <th className="px-4 py-3 font-semibold">County / city</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.coalitionIntake.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedIntakeId === row.id ? "bg-[var(--ep-gold)]/10" : "hover:bg-[var(--ep-cream)]/30"}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadgeClass(row.status)}`}
                      >
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.userName ?? row.title ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                      {row.coalitionSignals.join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                      {[row.county, row.city].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={row.detailHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payload.coalitionIntake.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                No coalition-signal intakes in queue — partner volunteers appear here when they self-identify.
              </p>
            ) : null}
          </div>
        </section>

        {selected ? <IntakeDetailPanel row={selected} /> : null}

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Coalition lane leaders</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Liaisons, outreach leads, and coalition-first operators — drill into partner workbenches from each row.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payload.coalitionLeaders.map((leader) => (
              <li key={leader.slug} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link href={leader.workbenchHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {leader.displayName}
                  </Link>
                  <span className="font-mono text-xs font-bold text-[var(--ep-blue)]">{leader.initials}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{leader.roleLabel}</p>
                {leader.coalitionWorkbench ? (
                  <Link
                    href={`/election-plan/workbenches/${leader.coalitionWorkbench}`}
                    className="mt-2 inline-block text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                  >
                    {leader.coalitionWorkbench} workbench →
                  </Link>
                ) : null}
                <Link
                  href={leader.laneDrillDownHref}
                  className="mt-3 inline-block text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                >
                  Coalition lane drill-down →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Coalition lane playbook</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ep-navy-muted)]">
            <li>Trust before asks — update validator lists on coalition workbenches before outreach scales.</li>
            <li>Route partner volunteers from intake to the correct coalition workbench — not generic county placement.</li>
            <li>Log partner meetings in the field log — leader and conversation categories feed this rollup.</li>
            <li>Escalate Kelly or HQ needs through leader command — no unsourced partner claims in public comms.</li>
            <li>
              Election Plan coalition tab still holds the legacy power map — this board is the operator workflow surface.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function WorkbenchRow({ row }: { row: CoalitionWorkbenchRow }) {
  return (
    <tr className="hover:bg-[var(--ep-cream)]/30">
      <td className="px-4 py-3">
        <p className="font-semibold text-[var(--ep-navy)]">{row.name}</p>
        {row.tagline ? <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)] line-clamp-1">{row.tagline}</p> : null}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        {row.communityLead ?? (row.hasOwner ? "Assigned" : "— open —")}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${readinessBadgeClass(row.readinessBand)}`}
        >
          {row.readinessPct}%
        </span>
      </td>
      <td className="px-4 py-3 tabular-nums text-xs text-[var(--ep-navy-muted)]">{row.relationshipCount}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        {row.intelPagesFilled}/{row.frameworkSectionCount}
      </td>
      <td className="px-4 py-3">
        <Link href={row.workbenchHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Open →
        </Link>
      </td>
    </tr>
  );
}

function IntakeDetailPanel({ row }: { row: CoalitionIntakeQueueRow }) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Partner intake</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
        {row.title ?? row.userName ?? "Volunteer intake"}
      </h2>
      {row.coalitionSignals.length > 0 ? (
        <p className="mt-3 text-sm text-[var(--ep-navy)]">
          <span className="font-semibold">Coalition signals:</span> {row.coalitionSignals.join(" · ")}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <form action={markVolunteerIntakeInReviewAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            In review
          </button>
        </form>
        <form action={markVolunteerIntakeAwaitingInfoAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full border border-[var(--ep-navy)]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]"
          >
            Awaiting info
          </button>
        </form>
        <form action={markVolunteerIntakeActivatedAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            Mark activated
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
        <Link href={`/election-plan/operators/volunteer-intake?intake=${row.id}`} className="text-[var(--ep-blue)] hover:underline">
          Full volunteer intake queue →
        </Link>
        <Link href="/election-plan/workbenches?kind=coalition" className="text-[var(--ep-blue)] hover:underline">
          Coalition workbenches →
        </Link>
        <Link href="/election-plan/operators/leaders/command" className="text-[var(--ep-blue)] hover:underline">
          Leader command — assign placement →
        </Link>
      </div>
    </section>
  );
}
