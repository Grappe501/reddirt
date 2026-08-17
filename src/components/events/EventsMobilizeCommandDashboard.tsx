import Link from "next/link";

import type {
  EventsCommandDashboardPayload,
  EventsCommandQueueRow,
  EventsMobilizeGapRow,
  EventsPromotionRow,
} from "@/lib/events/load-events-command-dashboard";

type Props = {
  payload: EventsCommandDashboardPayload;
  selectedEventId?: string;
};

export function EventsMobilizeCommandDashboard({ payload, selectedEventId }: Props) {
  const selected = payload.upcomingQueue.find((r) => r.recordId === selectedEventId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured — promotion queue depth needs <code className="text-xs">DATABASE_URL</code>.
            Forward Motion Mobilize gaps and field calendar still load from Election Plan snapshot.
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
            Promotion blocked:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.promotionBlocked}</span>
          </p>
          <p>
            Events lane leaders:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.eventsLeaders}</span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-sky-950">
          <p className="text-xs font-bold uppercase tracking-wide">Mobilize posture</p>
          <p className="mt-1 text-xs leading-relaxed">{payload.mobilizeIntegrationNote}</p>
        </div>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly events rhythm</h2>
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
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Mobilize gaps (21 days)</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Volunteer- or registration-heavy stops that need a Mobilize event before promotion goes live.
              </p>
            </div>
            <Link
              href="/election-plan/movement-infrastructure/mobilize-rules"
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Mobilize rules →
            </Link>
          </div>

          {payload.mobilizeGaps.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-white px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
              No Mobilize gaps in the next 21 days — or all required stops have Mobilize drafted.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {payload.mobilizeGaps.map((gap) => (
                <MobilizeGapRow key={gap.eventId} gap={gap} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Upcoming events (14 days)</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Field calendar — promotion status, missing info, and Forward Motion command links.
              </p>
            </div>
            <Link href="/election-plan?tab=fieldCalendar" className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
              Field calendar →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Promotion</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.upcomingQueue.map((row) => (
                  <UpcomingEventRow key={row.recordId} row={row} selected={selectedEventId === row.recordId} />
                ))}
              </tbody>
            </table>
            {payload.upcomingQueue.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                No field stops in the next 14 days — check the full campaign calendar.
              </p>
            ) : null}
          </div>
        </section>

        {selected ? <EventDetailPanel row={selected} /> : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Promotion queue</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Ready for tentative/official promotion or blocked — campaign manager executes in admin.
              </p>
            </div>
            <Link
              href={`/admin/campaign-events/calendar-promotion?month=${payload.period}`}
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Calendar promotion (admin) →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Readiness</th>
                  <th className="px-4 py-3 font-semibold">Blockers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.promotionQueue.map((row) => (
                  <PromotionRow key={`${row.recordId}-${row.promotionStatus}`} row={row} />
                ))}
              </tbody>
            </table>
            {payload.promotionQueue.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                No promotion rows loaded — connect DB or use admin calendar promotion workbench.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Post-event closeout</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Past approved stops — hot wash, field log, and thank-yous within 48 hours.
              </p>
            </div>
          </div>

          {payload.hotWashQueue.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-white px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
              No past approved events in this period snapshot — or closeout is current.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {payload.hotWashQueue.slice(0, 12).map((row) => (
                <li
                  key={row.recordId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--ep-navy)]/10 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[var(--ep-navy)]">{row.title}</p>
                    <p className="text-xs text-[var(--ep-navy-muted)]">
                      {row.dateYmd}
                      {[row.city, row.county].filter(Boolean).length > 0
                        ? ` · ${[row.city, row.county].filter(Boolean).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <Link href={row.adminReviewHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                    Admin review →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Events lane leaders</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Event chairs, planners, and lane leads — drill into run of show and Mobilize on each workbench.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payload.eventsLeaders.map((leader) => (
              <li key={leader.slug} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link href={leader.workbenchHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {leader.displayName}
                  </Link>
                  <span className="font-mono text-xs font-bold text-[var(--ep-blue)]">{leader.initials}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{leader.roleLabel}</p>
                {leader.counties.length > 0 ? (
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{leader.counties.join(" · ")}</p>
                ) : null}
                <Link
                  href={leader.laneDrillDownHref}
                  className="mt-3 inline-block text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                >
                  Events lane drill-down →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Events & Mobilize playbook</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ep-navy-muted)]">
            <li>Confirm roles on the event workbench before public promotion.</li>
            <li>Create Mobilize shifts when volunteer or registration goals apply — see Mobilize rules.</li>
            <li>Align comms copy 72 hours ahead via the statewide comms command.</li>
            <li>Log attendance and new contacts in the field log within 48 hours of every event.</li>
            <li>
              Campaign manager runs calendar promotion and hot wash in{" "}
              <Link href="/admin/campaign-manager-dashboard" className="font-semibold text-[var(--ep-blue)] hover:underline">
                admin
              </Link>
              — this board is the operator coordination surface.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function EventDetailPanel({ row }: { row: EventsCommandQueueRow }) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Event detail</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">{row.title}</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        {row.dateYmd} · {row.timeLabel}
        {[row.city, row.county].filter(Boolean).length > 0
          ? ` · ${[row.city, row.county].filter(Boolean).join(", ")}`
          : ""}
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Decision</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">{row.decisionLabel ?? row.reviewStatus}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Promotion</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">{row.promotionStatus.replaceAll("_", " ")}</dd>
        </div>
        {row.partyChair ? (
          <div>
            <dt className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">County party</dt>
            <dd className="mt-1 text-[var(--ep-navy)]">{row.partyChair}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
        {row.partyOfficersHref ? (
          <Link href={row.partyOfficersHref} className="text-[var(--ep-blue)] hover:underline">
            County party officers →
          </Link>
        ) : null}
        {row.forwardMotionHref ? (
          <Link href={row.forwardMotionHref} className="text-[var(--ep-blue)] hover:underline">
            Forward Motion command center →
          </Link>
        ) : null}
        <Link href={row.adminReviewHref} className="text-[var(--ep-blue)] hover:underline">
          Admin calendar review →
        </Link>
        <Link href="/election-plan/operators/comms-command" className="text-[var(--ep-blue)] hover:underline">
          Comms alignment →
        </Link>
      </div>
    </section>
  );
}

function UpcomingEventRow({ row, selected }: { row: EventsCommandQueueRow; selected: boolean }) {
  const flags = [
    row.missingInfo ? "Missing info" : null,
    row.duplicateRisk ? "Duplicate risk" : null,
    row.daysUntil <= 2 ? "Imminent" : null,
  ].filter(Boolean);

  return (
    <tr className={selected ? "bg-[var(--ep-gold)]/10" : "hover:bg-[var(--ep-cream)]/30"}>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        {row.dateYmd}
        <br />
        {row.timeLabel}
      </td>
      <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.title}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        {[row.city, row.county].filter(Boolean).join(" · ") || "—"}
      </td>
      <td className="px-4 py-3 text-xs uppercase text-[var(--ep-navy-muted)]">{row.promotionStatus.replaceAll("_", " ")}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{flags.join(" · ") || "—"}</td>
      <td className="px-4 py-3">
        <Link href={row.detailHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Review →
        </Link>
      </td>
    </tr>
  );
}

function MobilizeGapRow({ gap }: { gap: EventsMobilizeGapRow }) {
  return (
    <li className="rounded-xl border border-red-200/70 bg-red-50/40 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--ep-navy)]">{gap.eventName}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {gap.date} · {[gap.city, gap.county].filter(Boolean).join(", ")}
          </p>
          <p className="mt-2 text-xs font-bold uppercase text-red-900">{gap.warning}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Mobilize: {gap.mobilizeStatus || "not set"}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-950 ring-1 ring-red-200">
            {gap.daysUntil === 0 ? "Today" : gap.daysUntil === 1 ? "Tomorrow" : `${gap.daysUntil}d`}
          </span>
          <Link href={gap.forwardMotionHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
            Forward Motion →
          </Link>
        </div>
      </div>
    </li>
  );
}

function PromotionRow({ row }: { row: EventsPromotionRow }) {
  return (
    <tr className="hover:bg-[var(--ep-cream)]/30">
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.dateYmd}</td>
      <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.title}</td>
      <td className="px-4 py-3 text-xs uppercase text-[var(--ep-navy-muted)]">{row.promotionStatus.replaceAll("_", " ")}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.readiness}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.blockers.join("; ") || "—"}</td>
    </tr>
  );
}
