import Link from "next/link";

import {
  getArkansasCampuses,
  getCampusNetworkRollup,
  type ArkansasCampus,
} from "@/lib/election-plan/load-movement-infrastructure";
import { campusDetailHref, campusNetworkHref, phase18MasterPlanHref } from "@/lib/election-plan/phase-18-movement-infrastructure";
import { campusCaptainDashboardHref, freshmanWeekReadinessHref } from "@/lib/election-plan/load-citizen-voices-lte";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { formatBudget } from "@/lib/election-plan/electionPlanData";

function CaptainBadge({ status }: { status: ArkansasCampus["campusCaptainStatus"] }) {
  return (
    <span
      className={
        status === "filled"
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900"
          : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900"
      }
    >
      Captain {status}
    </span>
  );
}

export function CampusNetworkDashboardPanel() {
  const campuses = getArkansasCampuses();
  const rollup = getCampusNetworkRollup();

  return (
    <section>
      <Link href={phase18MasterPlanHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Phase 18
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Arkansas Higher Education Network</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Statewide campus dashboard · registration · volunteers · fundraising · captains</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={freshmanWeekReadinessHref()}
          className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
        >
          Freshman Week Readiness →
        </Link>
        <Link
          href={campusCaptainDashboardHref()}
          className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
        >
          Captain assignment →
        </Link>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.totalEnrollment.toLocaleString()}</div>
          <div className="ep-stat-label">Total enrollment</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.totalVotingAge.toLocaleString()}</div>
          <div className="ep-stat-label">Est. voting-age 18+</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.registrationGoal.toLocaleString()}</div>
          <div className="ep-stat-label">Registration goals</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.volunteerGoal}</div>
          <div className="ep-stat-label">Volunteer goals</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatBudget(rollup.fundraisingGoal)}</div>
          <div className="ep-stat-label">Fundraising goals</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.captainsFilled}/{rollup.campusCount}</div>
          <div className="ep-stat-label">Captains filled</div>
        </div>
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Campus</th>
              <th className="py-2 pr-3">County</th>
              <th className="py-2 pr-3">Enrollment</th>
              <th className="py-2 pr-3">Reg goal</th>
              <th className="py-2 pr-3">Vol goal</th>
              <th className="py-2 pr-3">Fundraising</th>
              <th className="py-2 pr-3">Captain</th>
              <th className="py-2">Mobilize</th>
            </tr>
          </thead>
          <tbody>
            {campuses.map((c) => (
              <tr key={c.slug} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3">
                  <Link href={campusDetailHref(c.slug)} className="font-medium hover:underline">
                    {c.shortName}
                  </Link>
                  <p className="text-xs text-[var(--ep-navy-muted)]">{c.type.replace("_", " ")}</p>
                </td>
                <td className="py-2 pr-3">{c.county}</td>
                <td className="py-2 pr-3 tabular-nums">{c.enrollment.toLocaleString()}</td>
                <td className="py-2 pr-3 tabular-nums">{c.registrationGoal.toLocaleString()}</td>
                <td className="py-2 pr-3 tabular-nums">{c.volunteerGoal}</td>
                <td className="py-2 pr-3 tabular-nums">{formatBudget(c.fundraisingGoal)}</td>
                <td className="py-2 pr-3">
                  <CaptainBadge status={c.campusCaptainStatus} />
                </td>
                <td className="py-2 tabular-nums">{c.mobilizeEvents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CampusDetailPanel({ campus }: { campus: ArkansasCampus }) {
  return (
    <section>
      <Link href={campusNetworkHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← All campuses
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{campus.name}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {campus.city} · {campus.county} County · {campus.type.replace("_", " ")}
          </p>
        </div>
        <CaptainBadge status={campus.campusCaptainStatus} />
      </div>

      {campus.notes ? <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">{campus.notes}</p> : null}

      <div className="my-6 ep-stat-grid">
        {[
          ["Enrollment", campus.enrollment.toLocaleString()],
          ["Voting-age est.", campus.votingAgeEstimate.toLocaleString()],
          ["Registration goal", campus.registrationGoal.toLocaleString()],
          ["Volunteer goal", String(campus.volunteerGoal)],
          ["Fundraising goal", formatBudget(campus.fundraisingGoal)],
          ["Kelly appearances", String(campus.kellyAppearances)],
          ["Events hosted", String(campus.eventsHosted)],
          ["Mobilize events", String(campus.mobilizeEvents)],
          ["Power of 5 leaders", String(campus.powerOf5Leaders)],
        ].map(([label, value]) => (
          <div key={label} className="ep-stat">
            <div className="ep-stat-value text-lg">{value}</div>
            <div className="ep-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {campus.freshmanWeekOpportunity && campus.freshmanWeekReadiness ? (
        <div className="ep-card mb-6 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading font-bold">Freshman Week Readiness</h2>
            <Link href={freshmanWeekReadinessHref()} className="text-xs font-semibold underline">
              Dashboard →
            </Link>
          </div>
          <ul className="mt-3 space-y-1 text-[var(--ep-navy-muted)]">
            {(
              [
                ["Captain assigned", campus.freshmanWeekReadiness.captainAssigned],
                ["Table location secured", campus.freshmanWeekReadiness.tableLocationSecured],
                ["Mobilize event created", campus.freshmanWeekReadiness.mobilizeEventCreated],
                ["Volunteers assigned", campus.freshmanWeekReadiness.volunteersAssigned],
                ["Registration materials ready", campus.freshmanWeekReadiness.registrationMaterialsReady],
              ] as const
            ).map(([label, ok]) => (
              <li key={label}>
                {ok ? "✓" : "○"} {label}
              </li>
            ))}
            <li>Kelly appearance: {campus.freshmanWeekReadiness.kellyAppearanceStatus.replace(/_/g, " ")}</li>
          </ul>
        </div>
      ) : null}

      <div className="ep-card mb-6 text-sm">
        <h2 className="font-heading font-bold">Campus operating plan</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          <li>Assign campus captain — vacant until filled</li>
          <li>Create Mobilize event for tabling / Kelly appearance (required when volunteer or reg goals &gt; 0)</li>
          {campus.freshmanWeekOpportunity ? <li>Freshman week blitz — August tabling (Phase 18.9)</li> : null}
          <li>Campus fundraiser co-host with Young Dems / campus org (Phase 18.8)</li>
          <li>Story Corps campus team — student-generated vertical video</li>
        </ul>
      </div>

      <Link href={countyPlaybookHref(campus.county, campus.county.toLowerCase())} className="ep-chapter-link text-sm">
        {campus.county} County playbook →
      </Link>
    </section>
  );
}
