import Link from "next/link";

import { FundraisingCompensationNote } from "@/components/dashboard/vos/FundraisingCompensationNote";
import { TwentySquareProgress } from "@/components/dashboard/vos/TwentySquareProgress";
import {
  buildDemoFundraisingKpis,
  DEMO_FUNDRAISING_LEADS,
  FUNDRAISING_RESOURCE_LIBRARY,
  FUN_FUNDRAISING_IDEAS,
  fundraisingKpiPercent,
} from "@/lib/volunteer-ops/fundraising-tab-demo";
import type { FundraisingMaturityGate } from "@/lib/volunteer-ops/fundraising-maturity";
import {
  FUNDRAISING_INTRO_COPY,
  fundraisingGateForMaturity,
} from "@/lib/volunteer-ops/fundraising-maturity";
import { inferVosMaturityFromTeam, VOS_MATURITY_LEVEL_TITLES } from "@/lib/volunteer-ops/vos-team-maturity";
import type { Team } from "@/types/dashboard";

function GateBanner({ maturity, gate }: { maturity: number; gate: FundraisingMaturityGate }) {
  if (gate === "hidden") {
    return (
      <div className="rounded-2xl border border-kelly-text/15 bg-kelly-fog/50 p-5 md:p-6">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Maturity · Level {maturity}</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Fundraising is not a first-week core task</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
          Stay focused on triad rhythm, first gatherings, and registration help. {FUNDRAISING_INTRO_COPY} You will see a fuller
          fundraising workspace starting around <span className="font-semibold text-kelly-deep">Level 3–4</span> (Operate → Expand).
        </p>
      </div>
    );
  }
  if (gate === "preview") {
    return (
      <div className="rounded-2xl border border-kelly-blue/30 bg-kelly-blue/[0.06] p-5 md:p-6">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/70">Maturity · Level {maturity} · Early look</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Fundraising — coming when your team is ready</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{FUNDRAISING_INTRO_COPY}</p>
        <p className="mt-3 font-body text-sm text-kelly-text/75">
          At Level 4 (Expand), your Events lane will prioritize recruiting a fundraising helper. For now, keep hosting and pipeline
          work sharp.
        </p>
      </div>
    );
  }
  if (gate === "recruit") {
    return (
      <div className="rounded-2xl border border-kelly-gold/40 bg-kelly-gold/[0.08] p-5 md:p-6">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/70">Maturity · Level {maturity} · Recruit</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Name a fundraising lead</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
          Your team is stable enough to add a fundraising helper. Use the team builder below — the Events Coordinator does not
          need to carry every dollar conversation personally.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-kelly-success/35 bg-kelly-success/[0.08] p-5 md:p-6">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/70">Maturity · Level {maturity} · Operate</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Run fundraising events and report results</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
        Track donors, parties, and hosts weekly. College teams: celebrate donor count before dollars. Adult teams: receptions and
        host circles stay relational and compliant.
      </p>
    </div>
  );
}

export function TeamFundraisingTabContent({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const maturity = inferVosMaturityFromTeam(team);
  const gate = fundraisingGateForMaturity(maturity);
  const levelTitle = VOS_MATURITY_LEVEL_TITLES[maturity];
  const kpis = buildDemoFundraisingKpis(DEMO_FUNDRAISING_LEADS);
  const eventsHref = `/dashboard/team/${teamSlug}/events`;
  const trainingHref = `/dashboard/team/${teamSlug}/training#training-module-building-local-fundraising-team`;
  const resourcesHref = `/dashboard/team/${teamSlug}/resources#fundraising-resources`;

  const showFullWorkspace = gate === "recruit" || gate === "operate";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Events lane · Week 4 / Level 4 maturity</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Field fundraising operating system</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{FUNDRAISING_INTRO_COPY}</p>
        <p className="mt-2 font-body text-xs text-kelly-text/65">
          Mapped to Volunteer OS <span className="font-semibold text-kelly-navy">Level {maturity}</span> · {levelTitle}. Fundraising
          deepens after your team has operating rhythm — not day one.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={eventsHref} className="font-semibold text-kelly-blue underline">
            ← Events lane
          </Link>
          <Link href={trainingHref} className="font-semibold text-kelly-blue underline">
            Training · Building a local fundraising team
          </Link>
          <Link href={resourcesHref} className="font-semibold text-kelly-blue underline">
            Fundraising resources (review status)
          </Link>
        </div>
      </section>

      <GateBanner maturity={maturity} gate={gate} />

      <FundraisingCompensationNote />

      {showFullWorkspace ? (
        <>
          <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Fundraising overview</h3>
            <p className="mt-2 font-body text-sm text-kelly-text/85">
              Fundraising sits under the Events lane first; dedicated fundraising teams can spin out later. County goal: at least one
              fundraising party per county between now and September where hosts and compliance allow — stack multiple events when the
              circle can sustain it.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-kelly-navy/15 bg-white p-6 shadow-sm md:p-8">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Adult fundraising track</h3>
              <p className="mt-2 font-body text-sm text-kelly-text/80">
                House parties, fundraising receptions, progressive dinners, host circles, professional networks, local donor
                introductions, and county fundraising parties.
              </p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 font-body text-sm text-kelly-text/85">
                <li>Anchor relational hosts who enjoy connecting people.</li>
                <li>Pair every reception with a clear follow-up owner and treasurer touchpoint.</li>
                <li>County party checklist moves through finance review before invites print.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.05] p-6 shadow-sm md:p-8">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">College fundraising track</h3>
              <p className="mt-2 font-body text-sm text-kelly-text/80">
                Small-dollar gifts ($5 / $10), campus competitions, social fundraising, QR sharing — prioritize{" "}
                <span className="font-semibold text-kelly-deep">donor count</span> over total dollars. Do not pressure students toward
                large-dollar asks.
              </p>
              <div className="mt-4 rounded-lg border border-kelly-text/10 bg-white/80 p-3">
                <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/55">Gamification (college)</p>
                <p className="mt-1 font-body text-sm text-kelly-text/85">
                  Leaderboard: rank by unique donors first, then event participation, then dollars only as a tiebreaker.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-kelly-navy/[0.03] p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Fundraiser team builder</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
              The Events Coordinator does not have to do all fundraising personally. Their job is to identify the person in the area
              who enjoys hosting, connecting, and asking. You can name multiple leads: adult, college, neighborhood, and county-scoped
              fundraisers as geography grows.
            </p>
            {gate === "recruit" ? (
              <p className="mt-3 font-body text-sm font-semibold text-kelly-deep">
                Action this week: ask one host-forward volunteer if they will trial a small-dollar or reception-style event with
                treasurer support.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Personal link & QR — coming after finance setup</h3>
            <p className="mt-2 font-body text-sm text-kelly-text/80">
              Every fundraiser will eventually receive a personal fundraising link, QR asset, and short link tracked here.{" "}
              <span className="font-semibold text-kelly-navy">Personal links will be generated after finance and compliance signoff.</span>
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-kelly-text/75">
              <li>Personal fundraising link — pending setup</li>
              <li>Personal QR asset — pending setup</li>
              <li>Short share link — pending setup</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Donor count scoreboard (practice roster)</h3>
            <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10">
              <table className="min-w-[640px] w-full border-collapse text-left font-body text-xs">
                <thead>
                  <tr className="border-b border-kelly-text/15 bg-kelly-fog/60">
                    <th className="px-3 py-2 font-bold">Name</th>
                    <th className="px-3 py-2 font-bold">Geography</th>
                    <th className="px-3 py-2 font-bold">Track</th>
                    <th className="px-3 py-2 font-bold">Status</th>
                    <th className="px-3 py-2 font-bold">Donors</th>
                    <th className="px-3 py-2 font-bold">$ raised</th>
                    <th className="px-3 py-2 font-bold">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_FUNDRAISING_LEADS.map((row) => (
                    <tr key={row.id} className="border-b border-kelly-text/10">
                      <td className="px-3 py-2 font-semibold text-kelly-deep">{row.name}</td>
                      <td className="px-3 py-2 text-kelly-text/80">{row.geography}</td>
                      <td className="px-3 py-2 capitalize">{row.track}</td>
                      <td className="px-3 py-2">{row.status.replace("_", " ")}</td>
                      <td className="px-3 py-2 font-mono">{row.donorCount}</td>
                      <td className="px-3 py-2 font-mono">${row.dollarsRaised.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{row.eventsHosted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Fun fundraising event ideas</h3>
            <ul className="mt-4 columns-1 gap-x-8 font-body text-sm text-kelly-text/85 sm:columns-2">
              {FUN_FUNDRAISING_IDEAS.map((idea) => (
                <li key={idea} className="break-inside-avoid py-1">
                  · {idea}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Fundraising KPIs · 20-square (planning caps)</h3>
            <p className="mt-2 font-body text-xs text-kelly-text/65">
              Percentages are illustrative against soft caps until live finance aggregates connect.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <TwentySquareProgress
                label="Leads recruited"
                percent={fundraisingKpiPercent(kpis.leadsRecruited, 12)}
                caption={`${kpis.leadsRecruited} / 12`}
              />
              <TwentySquareProgress
                label="Active fundraisers"
                percent={fundraisingKpiPercent(kpis.activeFundraisers, 8)}
                caption={`${kpis.activeFundraisers} / 8`}
              />
              <TwentySquareProgress
                label="Donor count (all)"
                percent={fundraisingKpiPercent(kpis.donorCount, 120)}
                caption={`${kpis.donorCount} donors`}
              />
              <TwentySquareProgress
                label="College donor count"
                percent={fundraisingKpiPercent(kpis.collegeDonorCount, 100)}
                caption={`${kpis.collegeDonorCount} (priority metric)`}
              />
              <TwentySquareProgress
                label="Adult donor count"
                percent={fundraisingKpiPercent(kpis.adultDonorCount, 80)}
                caption={`${kpis.adultDonorCount}`}
              />
              <TwentySquareProgress
                label="County parties completed"
                percent={fundraisingKpiPercent(kpis.countyPartiesCompleted, 12)}
                caption={`${kpis.countyPartiesCompleted} done · ${kpis.countyPartiesScheduled} scheduled`}
              />
            </div>
          </section>

          <section id="fundraising-resources" className="rounded-2xl border border-kelly-text/10 bg-kelly-fog/40 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Resource library (review workflow)</h3>
            <p className="mt-2 font-body text-sm text-kelly-text/80">
              Downloadable versions move{" "}
              <span className="font-semibold">
                Draft → Internal review → Ernie review → Design preview → Approved → Published
              </span>
              .
              Nothing here is a final public download yet.
            </p>
            <ul className="mt-4 space-y-3">
              {FUNDRAISING_RESOURCE_LIBRARY.map((r) => (
                <li
                  key={r.title}
                  className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 font-body text-sm text-kelly-text/85"
                >
                  <span className="font-semibold text-kelly-navy">{r.title}</span>
                  <span className="mx-2 text-kelly-text/40">·</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-kelly-text/55">{r.stage}</span>
                  <span className="mt-1 block text-xs text-kelly-text/65">{r.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Early look · tracks at a glance</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Adult track emphasizes receptions, host circles, and county parties. College track emphasizes donor count and $5/$10
            gifts — full roster tools unlock at Level 4.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/80">
            <li>Adult: house parties, progressive dinners, professional networks, county parties.</li>
            <li>College: campus competitions, QR nights, social fundraisers — no high-pressure big-dollar scripts.</li>
          </ul>
        </section>
      )}
    </div>
  );
}
