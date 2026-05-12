import Link from "next/link";

import {
  MOCK_DOWNSTREAM_TREE,
  EVENTS_COORDINATOR_RESPONSIBILITIES,
  EVENTS_DAILY_TASK,
  EVENTS_KPIS,
  EVENTS_MONTHLY_GOALS,
  EVENTS_WEEKLY_TASKS,
} from "@/lib/dashboard/mock-data";
import type { Team } from "@/types/dashboard";
import { inferVosMaturityFromTeam } from "@/lib/volunteer-ops/vos-team-maturity";
import { FUNDRAISING_INTRO_COPY, fundraisingGateForMaturity } from "@/lib/volunteer-ops/fundraising-maturity";
import { VosKpiMiniGrid } from "@/components/dashboard/vos/VosKpiSummary";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_EVENTS } from "@/lib/campaign-assets";
import { SpeakingOpportunitiesWorkspace } from "@/components/dashboard/vos/SpeakingOpportunitiesWorkspace";

export function TeamEventsTabContent({ team }: { team: Team }) {
  const maturity = inferVosMaturityFromTeam(team);
  const showSpeaking = maturity >= 3;
  const frGate = fundraisingGateForMaturity(maturity);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Events lane</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Purpose</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
              The Events Coordinator helps identify and coordinate every opportunity for Kelly to connect with voters. Nothing is too small:
              school functions, chamber meetings, ribbon cuttings, county fairs, festivals, parades, civic clubs, town halls, and
              church or community gatherings. This lane now includes <span className="font-semibold text-kelly-navy">county fundraising receptions</span>,{" "}
              <span className="font-semibold text-kelly-navy">Weekend Community Immersions</span>, and the{" "}
              <span className="font-semibold text-kelly-navy">two-day city visit</span> pattern — all documented in the field playbook and volunteer Events hub.
            </p>
          </div>
          <KellyAccentCutout src={KELLY_ACCENT_EVENTS} className="md:mt-1" />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-gold/35 bg-kelly-gold/[0.07] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/60">Field fundraising OS · Events sub-lane</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Fundraising (Week 4 / Level 4)</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{FUNDRAISING_INTRO_COPY}</p>
        <p className="mt-2 font-body text-xs text-kelly-text/70">
          Maturity gate:{" "}
          <span className="font-semibold text-kelly-navy">
            {frGate === "hidden" ? "Focus on events pipeline first" : frGate === "preview" ? "Preview mode" : "Recruit / operate"}
          </span>
          .
        </p>
        <div className="mt-4">
          <Link
            href={`/dashboard/team/${team.slug}/fundraising`}
            className="inline-flex rounded-lg bg-kelly-navy px-4 py-2 font-body text-sm font-semibold text-kelly-fog hover:bg-kelly-blue"
          >
            Open fundraising workspace →
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Daily</h3>
        <p className="mt-3 font-body text-sm font-semibold text-kelly-deep">{EVENTS_DAILY_TASK.title}</p>
        {EVENTS_DAILY_TASK.description ? (
          <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{EVENTS_DAILY_TASK.description}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Weekly</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          {EVENTS_WEEKLY_TASKS.map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Responsibilities</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          {EVENTS_COORDINATOR_RESPONSIBILITIES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Monthly goals</h3>
        <ul className="mt-4 space-y-2 font-body text-sm text-kelly-text/85">
          {EVENTS_MONTHLY_GOALS.map((t) => (
            <li key={t.id} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>{t.title}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Events lane · planning KPIs</p>
          <VosKpiMiniGrid kpis={EVENTS_KPIS} />
        </div>
      </section>

      {showSpeaking ? (
        <SpeakingOpportunitiesWorkspace />
      ) : (
        <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Coming later · Speaking opportunities</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Find local speaking opportunities for Kelly</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Unlocks at <span className="font-semibold text-kelly-deep">Level 3 · Operate</span>. Your team reads as{" "}
            <span className="font-semibold text-kelly-navy">Level {maturity}</span> — focus on pipeline basics and first hosted
            moments first.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-6 md:p-8" id="county-fundraising">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">County fundraising parties (through September)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Strategic objective: <span className="font-semibold text-kelly-deep">each county should host at least one fundraising event</span>{" "}
          between now and September when hosts and compliance allow. Multiple events are welcome — stagger dates so you do not exhaust the same
          circle.
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/70">
          Copy this grid into your sheet or HQ workbook: county, host, date, goal, guest target, invites sent, RSVP, amount raised,
          treasurer reconciliation, and follow-up complete.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white">
          <table className="min-w-[720px] w-full border-collapse font-body text-left text-xs text-kelly-deep">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-fog/60">
                <th className="px-3 py-2 font-bold">County</th>
                <th className="px-3 py-2 font-bold">Host ID</th>
                <th className="px-3 py-2 font-bold">Date</th>
                <th className="px-3 py-2 font-bold">Goal $</th>
                <th className="px-3 py-2 font-bold">Guest tgt</th>
                <th className="px-3 py-2 font-bold">Invites</th>
                <th className="px-3 py-2 font-bold">RSVP</th>
                <th className="px-3 py-2 font-bold">Raised</th>
                <th className="px-3 py-2 font-bold">FU ✓</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-kelly-text/10">
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">—</td>
                <td className="px-3 py-2 text-kelly-text/55">☐</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-body text-sm">
          <Link href="/field-playbook/roles/fundraising-receptions-county" className="font-semibold text-kelly-blue underline">
            Fundraising Event Toolkit (playbook)
          </Link>{" "}
          ·{" "}
          <Link href="/volunteer/resources/events-lane" className="font-semibold text-kelly-blue underline">
            Events lane hub
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8" id="event-automation">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Event automation (Action Queue)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          When events are created in Admin with the right <span className="font-mono text-[11px]">campaignIntent</span>, specialized tasks spawn
          (invitations, RSVP hygiene, faith protocol, fundraiser host circle, weekend grid). Generic appearance prep still applies to applicable{" "}
          <span className="font-mono text-[11px]">eventTypes</span>. Seed workflow keys:{" "}
          <span className="font-mono text-[11px]">vos_house_party_v1</span>,{" "}
          <span className="font-mono text-[11px]">vos_county_fundraiser_v1</span>,{" "}
          <span className="font-mono text-[11px]">vos_weekend_immersion_v1</span>,{" "}
          <span className="font-mono text-[11px]">vos_faith_visit_v1</span>.
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/65">
          Constants: <span className="font-mono">src/lib/campaign-ops/events-workflow-intents.ts</span>
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2" id="event-pipeline">
        <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Event pipeline</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/75">
            Living list for {team.displayName}. Add anything that could put Kelly in front of real voters.
          </p>
          <ul className="mt-4 space-y-3">
            {team.eventPipeline.map((row) => (
              <li key={row.id} className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-bold text-kelly-deep">{row.title}</span>
                  <span className="rounded-md bg-kelly-fog px-2 py-0.5 font-body text-[10px] font-semibold text-kelly-deep">
                    {row.status}
                  </span>
                </div>
                {row.notes ? <p className="mt-2 font-body text-xs text-kelly-text/75">{row.notes}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8" id="kelly-visit">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Kelly visit planner</h3>
          <ul className="mt-4 space-y-3">
            {team.visitPlans.map((v) => (
              <li key={v.id} className="rounded-xl border border-kelly-text/10 bg-kelly-fog/50 px-4 py-3">
                <p className="font-body text-sm font-semibold text-kelly-deep">{v.label}</p>
                <p className="mt-1 font-body text-xs text-kelly-text/70">{v.status}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-body text-xs text-kelly-text/65">
            County view also surfaces downstream teams launching local stops:{" "}
            <span className="font-semibold text-kelly-navy">{MOCK_DOWNSTREAM_TREE.displayName}</span> hierarchy.
          </p>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8" id="house-party">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">House party playbook</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Full execution manual: host recruitment, guest targets, invitation scripts, reminder schedule, room setup, talking points, compliant
            donation variant, and follow-up — plus meet-and-greet, listening, student, and volunteer-recruitment formats.
          </p>
          <ul className="mt-4 space-y-2 font-body text-sm">
            <li>
              <Link href="/field-playbook/roles/house-party-playbook" className="font-semibold text-kelly-blue underline">
                House party playbook (field manual)
              </Link>
            </li>
            <li>
              <Link href="/volunteer/resources/events-lane" className="font-semibold text-kelly-blue underline">
                Events lane hub
              </Link>
            </li>
          </ul>
        </section>
        <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8" id="town-halls">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Target county town halls</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Election Integrity Town Hall discussion tables: plan neutral rooms, trusted moderators, and clear escalation paths.
            Coordinate with upstream staff before locking dates.
          </p>
          <p className="mt-4 font-body text-xs text-kelly-text/60">
            KPI hook: &quot;Town halls planned&quot; appears in the Metrics tab as a monthly target.
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 shadow-[var(--shadow-soft)] md:p-8" id="city-student-stops">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">City days and student stops</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          When Kelly visits a city, <span className="font-semibold text-kelly-navy">Events</span> coordinates the run of show;
          student leaders help stack authentic campus and student moments (coffee, lunch table, afternoon campus, evening house
          party, optional after-dinner appetizers).
        </p>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          Field playbooks:{" "}
          <Link href="/field-playbook/roles/two-day-city-immersion" className="font-semibold text-kelly-blue underline">
            Two-day city immersion
          </Link>
          ,{" "}
          <Link href="/field-playbook/roles/weekend-community-immersion" className="font-semibold text-kelly-blue underline">
            Weekend Community Immersion
          </Link>
          ,{" "}
          <Link href="/field-playbook/roles/travel-rhythm-model" className="font-semibold text-kelly-blue underline">
            Travel rhythm
          </Link>
          . Student doctrine also lives on the Youth tab.
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8" id="county-clerk">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">County Clerk visit (county seat)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          When in the county seat, attempt a County Clerk / elections office touch — professional tone, accurate registration
          partnership. Track contacted → requested → scheduled → completed → follow-up.
        </p>
        {team.youthOutreach?.countyClerkVisits.length ? (
          <ul className="mt-4 space-y-2">
            {team.youthOutreach.countyClerkVisits.map((row) => (
              <li key={row.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-sm">
                <span className="font-semibold text-kelly-deep">{row.countySeatLabel}</span>
                <span className="mt-1 block text-xs text-kelly-text/70">{row.status.replace(/^clerk-/, "").replace(/-/g, " ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 font-body text-xs text-kelly-text/65">No county clerk rows on this team bundle yet.</p>
        )}
        <p className="mt-4 font-body text-xs text-kelly-text/65">
          Playbook:{" "}
          <Link href="/field-playbook/roles/county-clerk-visit-checklist" className="font-semibold text-kelly-blue underline">
            County Clerk visit checklist
          </Link>
          . Mirror data on{" "}
          <Link href={`/dashboard/team/${team.slug}/youth-outreach#youth-events`} className="font-semibold text-kelly-blue underline">
            Youth tab · County Clerk block
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
