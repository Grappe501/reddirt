import Link from "next/link";
import type { MonthReadinessSnapshot } from "@/lib/campaign-events/month-readiness/build-month-readiness";
import type { MonthReadinessQueueLink } from "@/lib/campaign-events/month-readiness/month-readiness-types";
import { READINESS_BAND_LABELS } from "@/lib/campaign-events/month-readiness/month-readiness-types";

const BAND_STYLE: Record<string, string> = {
  not_ready: "border-red-700/30 bg-red-50 text-red-950",
  in_progress: "border-amber-700/30 bg-amber-50 text-amber-950",
  nearly_ready: "border-kelly-navy/30 bg-kelly-navy/[0.08] text-kelly-navy",
  ready: "border-emerald-700/30 bg-emerald-50 text-emerald-950",
};

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function QueueSection({ title, items }: { title: string; items: MonthReadinessQueueLink[] }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
      <h2 className="font-heading text-base font-bold text-kelly-text">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((q) => (
          <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 px-3 py-2 font-body text-sm">
            <div>
              <span className="font-semibold">{q.label}</span>
              {q.hint ? <p className="text-xs text-kelly-muted">{q.hint}</p> : null}
            </div>
            <Link
              href={q.href}
              className={`rounded-full px-3 py-1 text-xs font-bold ${q.count > 0 ? "bg-kelly-navy text-white" : "border border-kelly-text/15 text-kelly-subtle"}`}
            >
              {q.count} → Review
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MonthReadinessDashboard({ snapshot }: { snapshot: MonthReadinessSnapshot }) {
  const { period, monthLabel, stats, score, duplicates, travel, completionChecklist } = snapshot;
  const bandKey = score.band;

  return (
    <div className="flex flex-col gap-6">
      <section className={`rounded-3xl border p-6 ${BAND_STYLE[bandKey] ?? BAND_STYLE.in_progress}`}>
        <p className="font-body text-xs font-bold uppercase tracking-wider opacity-80">Month readiness score</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <p className="font-heading text-5xl font-bold">{score.scorePercent}%</p>
          <div>
            <p className="font-heading text-xl font-bold">{READINESS_BAND_LABELS[bandKey]}</p>
            <p className="mt-1 font-body text-sm opacity-85">
              {score.eventsScored} active events scored · May handoff gate: {score.moveToMayGatePercent}%+
            </p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-current transition-all" style={{ width: `${Math.min(100, score.scorePercent)}%` }} />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">1. Month overview</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-body text-sm">
          <div>
            <dt className="text-xs font-bold uppercase text-kelly-slate">Ledger events</dt>
            <dd className="font-heading text-2xl font-bold">{stats.total}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-kelly-slate">Approved</dt>
            <dd className="font-heading text-2xl font-bold">{stats.approved}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-kelly-slate">Unreviewed</dt>
            <dd className="font-heading text-2xl font-bold text-amber-900">{stats.unreviewed}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-kelly-slate">Travel report lines</dt>
            <dd className="font-heading text-2xl font-bold">{snapshot.travelLineCount}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href={`/admin/campaign-events/workbench?month=${period}`} className="font-semibold text-kelly-navy underline">
            Workbench
          </Link>
          <Link href={`/admin/campaign-events/review?month=${period}&mode=chronological`} className="underline">
            Month review
          </Link>
          <Link href={`/admin/campaign-events/travel-log?month=${period}`} className="underline">
            Tentative travel log
          </Link>
          <Link href={`/admin/campaign-events/travel-report?month=${period}`} className="underline">
            Travel report
          </Link>
          <Link href={`/admin/campaign-events/reimbursement?month=${period}`} className="underline">
            Official reimbursement request
          </Link>
        </div>
      </section>

      {duplicates.jsonRowCount > duplicates.uniqueIdCount ? (
        <section className="rounded-2xl border border-amber-700/35 bg-amber-50 p-5 font-body text-sm text-amber-950">
          <h2 className="font-heading font-bold text-amber-950">Source JSON duplicate notice</h2>
          <p className="mt-2">
            <strong>{monthLabel}</strong> source JSON contains <strong>{duplicates.jsonRowCount}</strong> rows but{" "}
            <strong>{duplicates.uniqueIdCount}</strong> unique calendar ids. One duplicate calendar id was deduped during seed
            (upsert by id — no duplicate DB rows).
          </p>
          {duplicates.duplicateGroups.length ? (
            <ul className="mt-3 space-y-2 rounded-lg border border-amber-800/20 bg-white/60 p-3 text-xs">
              {duplicates.duplicateGroups.map((g) => (
                <li key={g.calendarId}>
                  <strong>ID:</strong> <code>{g.calendarId}</code> · <strong>×{g.count}</strong>
                  <br />
                  Titles: {g.titles.join(" · ")}
                  <br />
                  Dates: {g.starts.join(", ")}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-5">
        <h2 className="font-heading text-base font-bold">Month close checklist</h2>
        <ul className="mt-4 space-y-2 font-body text-sm">
          {completionChecklist.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-lg border border-kelly-text/10 bg-kelly-page px-3 py-2">
              <span className={c.done ? "text-emerald-700" : "text-amber-800"} aria-hidden>
                {c.done ? "✓" : "○"}
              </span>
              <div>
                <p className="font-semibold">{c.label}</p>
                <p className="text-xs text-kelly-muted">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <QueueSection title="2. Missing location (city / county / ZIP)" items={snapshot.queues.location} />
      <QueueSection title="3. Missing mileage & travel" items={snapshot.queues.travel} />

      <QueueSection title="4. Review decisions" items={snapshot.queues.decisions} />

      <QueueSection title="5. Conflicts · 6. Work-hours warnings" items={snapshot.queues.warnings} />

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">7. Reimbursement readiness</h2>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          Est. reimbursement {fmtUsd(travel.totalReimbursement)} · Approved {fmtUsd(travel.approvedReimbursement)} ·{" "}
          <strong>{snapshot.unapprovedReimbursement}</strong> rows with reimbursement not yet approved
        </p>
        <Link
          href={`/admin/campaign-events/travel-report?month=${period}`}
          className="mt-3 inline-block rounded-full border border-kelly-navy/30 px-4 py-2 text-sm font-bold text-kelly-navy"
        >
          Open travel report
        </Link>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">8. Approval package readiness</h2>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          <strong>{snapshot.pendingApprovalPackages}</strong> events still need a decision or are tentative — approval email send
          remains disabled; preview packages in Month Review or drilldown.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-muted">Email sending not enabled yet. Default recipients configured in approval-recipients.ts.</p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">9. Travel report readiness</h2>
        <p className="mt-2 font-body text-sm">
          {travel.lineCount} travel-related lines · {travel.missingMileage} missing mileage · {travel.needsReviewCount} need review
        </p>
        <Link href={`/admin/campaign-events/travel-report?month=${period}`} className="mt-3 inline-block text-sm font-bold text-kelly-navy underline">
          Monthly travel report →
        </Link>
      </section>

      <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-wash/80 p-5 opacity-90">
        <h2 className="font-heading text-base font-bold text-kelly-text/80">10. Move to May (informational — not seeded)</h2>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          Do not start May operational review until {monthLabel} reaches <strong>{score.moveToMayGatePercent}%</strong> readiness
          {score.moveToMayRecommended ? " (gate met for current data)" : " (gate not met yet)"}.
        </p>
        <div className="mt-4 grid gap-2 font-mono text-xs text-kelly-muted">
          <p>npm run campaign-events:seed-month -- 2026-05</p>
          <p>/admin/campaign-events/workbench?month=2026-05</p>
          <p>/admin/campaign-events/review?month=2026-05</p>
          <p>/admin/campaign-events/travel-report?month=2026-05</p>
          <p>/admin/campaign-events/month-readiness?month=2026-05</p>
        </div>
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/40"
        >
          Seed May (disabled this pass)
        </button>
      </section>

      <QueueSection title="More queues" items={snapshot.queues.other} />
    </div>
  );
}
