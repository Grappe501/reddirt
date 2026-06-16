import Link from "next/link";

import type { CountyWorkbenchV4OperationalView } from "@/lib/election-plan/county-workbench/build-county-v4-operational";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | null;
}) {
  return (
    <div className="ep-stat">
      <div className="ep-stat-value text-lg">{value}</div>
      <div className="ep-stat-label">{label}</div>
      {note ? <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{note}</p> : null}
    </div>
  );
}

type Props = {
  countyName: string;
  ops: CountyWorkbenchV4OperationalView;
};

export function CountyWorkbenchV4OperationsPanel({ countyName, ops }: Props) {
  return (
    <>
      <section id="leadership" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Leadership</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          County operating roles — OPEN until strike team or PPEN assigns a named lead.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ops.leadership.map((slot) => (
            <li
              key={slot.key}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                slot.status === "assigned"
                  ? "border-[var(--ep-border)] bg-white"
                  : "border-dashed border-[var(--ep-border)] bg-[var(--ep-cream)]/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-[var(--ep-navy)]">{slot.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase",
                    slot.status === "assigned" ? "text-emerald-700" : "text-[var(--ep-gold)]",
                  )}
                >
                  {slot.status === "assigned" ? slot.assigneeName : slot.status === "recruiting" ? "RECRUITING" : "OPEN"}
                </span>
              </div>
              {slot.status === "assigned" && slot.assigneeName ? (
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{slot.assigneeName}</p>
              ) : slot.interestedCandidates > 0 ? (
                <p className="mt-1 text-xs font-semibold text-[var(--ep-gold)]">
                  {slot.interestedCandidates} interested participant{slot.interestedCandidates === 1 ? "" : "s"} · View
                  candidates (PPEN A.0b)
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
                  0 interested · PPEN A.0b onboarding pipeline
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="open-positions" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Open positions</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          {ops.openPositions.length} role{ops.openPositions.length === 1 ? "" : "s"} need a named lead in {countyName}{" "}
          County.
        </p>
        {ops.openPositions.length === 0 ? (
          <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">All framework roles assigned.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {ops.openPositions.map((s) => (
              <li
                key={s.key}
                className="rounded-full border border-dashed border-[var(--ep-gold)] bg-[var(--ep-gold-soft)] px-3 py-1 text-xs font-semibold text-[var(--ep-navy)]"
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="my-five" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">My Five · Network Growth</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Movement metrics — record-backed when PPEN pilot gate clears.</p>
        <div className="mt-4 ep-stat-grid">
          {ops.myFive.map((m) => (
            <MetricCard
              key={m.key}
              label={m.label}
              value={m.count == null ? "—" : String(m.count)}
              note={m.note}
            />
          ))}
        </div>
      </section>

      <section id="help-ten" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Help 10 Participate</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Civic engagement journey — separate from My Five network growth.</p>
        <div className="mt-4 ep-stat-grid">
          {ops.helpTen.map((m) => (
            <MetricCard key={m.key} label={m.label} value={String(m.count ?? 0)} note={m.note} />
          ))}
        </div>
      </section>

      <section id="volunteer-pipeline" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Volunteer pipeline</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Onboarding stages (PPEN) plus field log totals logged today in this county.
        </p>
        <div className="mb-4 ep-stat-grid">
          <MetricCard label="Field log · volunteers" value={String(ops.fieldLogVolunteers)} note="Record-backed field entries" />
          <MetricCard label="Field log · leaders" value={String(ops.fieldLogLeaders)} note="Po5 / captain field log" />
        </div>
        <div className="ep-stat-grid">
          {ops.volunteerPipeline.map((m) => (
            <MetricCard key={m.key} label={m.label} value={String(m.count ?? 0)} note={m.note} />
          ))}
        </div>
      </section>

      <section id="communications" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Communications</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          County narrative flows through Campaign Communications Hub — Substack source of truth, SMOS downstream.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/election-plan?tab=campaignCommunications" className="ep-chapter-link font-semibold">
            Campaign Communications Hub →
          </Link>
          <Link href="/election-plan?tab=socialResume" className="ep-chapter-link font-semibold">
            Social Media OS →
          </Link>
        </div>
      </section>

      <section id="coalitions" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Coalitions</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Coalition workbenches connect to county field ops — same OS as cities.
        </p>
        <Link href="/election-plan/workbenches?kind=coalition" className="mt-3 inline-block text-sm font-semibold text-[var(--ep-gold)] underline">
          Open coalition workbenches →
        </Link>
      </section>

      <section id="documents" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Documents</h2>
        <p className="mt-2 text-sm italic text-[var(--ep-navy-muted)]">
          County document library — framework slot; uploads attach to county hub records in a later pass.
        </p>
      </section>

      <section id="activity" className="mb-10 scroll-mt-24">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Activity feed</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Field log entries and county events roll up here — see Field log and Events sections below.
        </p>
      </section>
    </>
  );
}
