import Link from "next/link";

import { CAMPAIGN_CONTACT_EMAIL } from "@/lib/campaign-links";
import { YOUTH_EVENT_DOCTRINE, YOUTH_REPORTING_HIERARCHY_LINES } from "@/lib/volunteer-ops/youth-outreach-workspace";
import type { Team, YouthCampusLifecycleStatus, YouthCampusMappingRow, YouthCountyClerkVisitStatus } from "@/types/dashboard";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import { TwentySquareProgress } from "@/components/dashboard/vos/TwentySquareProgress";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_YOUTH_OUTREACH } from "@/lib/campaign-assets";

const SECTION_NAV: { id: string; label: string }[] = [
  { id: "youth-overview", label: "Overview" },
  { id: "youth-cross-campus", label: "Cross-campus" },
  { id: "youth-naming", label: "Team naming" },
  { id: "youth-campus-map", label: "Campus map" },
  { id: "youth-scoreboard", label: "Scoreboard" },
  { id: "youth-challenges", label: "Challenges" },
  { id: "youth-events", label: "Student events" },
  { id: "youth-immersion", label: "Immersion" },
  { id: "youth-high-school", label: "High school" },
  { id: "youth-college", label: "College" },
  { id: "youth-team-builder", label: "Team builder" },
  { id: "youth-social", label: "Social" },
  { id: "youth-registration", label: "VR drives" },
  { id: "youth-metrics", label: "Metrics" },
  { id: "youth-twenty", label: "20-square" },
  { id: "youth-resources", label: "Resources" },
  { id: "youth-messaging", label: "Messaging" },
];

function statusLabel(s: YouthCampusLifecycleStatus): string {
  const m: Record<YouthCampusLifecycleStatus, string> = {
    "not-started": "Not started",
    "lead-identified": "Lead identified",
    "team-building": "Team building",
    "active-team": "Active team",
    "expanding": "Expanding",
    "gotv-ready": "GOTV ready",
  };
  return m[s];
}

function clerkStatusLabel(s: YouthCountyClerkVisitStatus): string {
  const m: Record<YouthCountyClerkVisitStatus, string> = {
    "clerk-not-started": "Not started",
    "clerk-contacted": "Clerk contacted",
    "clerk-visit-requested": "Visit requested",
    "clerk-scheduled": "Scheduled",
    "clerk-completed": "Completed",
    "clerk-follow-up": "Follow-up notes",
  };
  return m[s];
}

function kindLabel(k: YouthCampusMappingRow["kind"]): string {
  return k.replace(/-/g, " ");
}

function kellyVisitMailto(teamDisplayName: string, geography: string): string {
  const to = CAMPAIGN_CONTACT_EMAIL.replace(/^mailto:/i, "");
  const subject = encodeURIComponent(`Request Kelly visit · student event · ${teamDisplayName}`);
  const body = encodeURIComponent(
    `Team: ${teamDisplayName}\nGeography: ${geography}\n\nStudent / school event request:\n- Host student:\n- School / org:\n- Date / time options:\n- Expected attendance:\n- Public vs closed event:\n- Parking / accessibility:\n`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function TeamYouthOutreachTabContent({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const y = team.youthOutreach;
  if (!y) {
    return (
      <p className="font-body text-sm text-kelly-text/75">
        Youth Outreach workspace is loading — if this persists, refresh the team dashboard.
      </p>
    );
  }

  const p5 = team.members.find((m) => m.role === "power-of-5");
  const visitHref = kellyVisitMailto(team.displayName, team.geography);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Power of 5 / VR · Youth Outreach</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">Youth Outreach lane</h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{y.p5VrLaneLabel}</p>
        <p className="mt-3 font-body text-xs text-kelly-text/70">
          Formal reporting: <span className="font-semibold text-kelly-deep">Youth Outreach Lead → P5 / Voter Registration Lead</span>
          {p5 ? (
            <>
              {" "}
              Triad P5 coordinator: <span className="font-semibold text-kelly-navy">{p5.name}</span>.
            </>
          ) : (
            <> — assign a Power of 5 / VR coordinator to own student rollups.</>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/team/${teamSlug}/power-of-5`}
            className="rounded-lg bg-kelly-navy px-3 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep"
          >
            P5 / VR parent lane
          </Link>
          <Link
            href="/volunteer/resources/youth-outreach"
            className="rounded-lg border border-kelly-navy/25 bg-white px-3 py-2 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            Youth resource library
          </Link>
          <a
            href={visitHref}
            className="rounded-lg border border-kelly-gold/40 bg-kelly-gold/10 px-3 py-2 font-body text-xs font-semibold text-kelly-deep hover:bg-kelly-gold/20"
          >
            Request Kelly visit
          </a>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-kelly-navy/12 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-body text-xs text-kelly-text/75">
            Student leaders grow when we pair encouragement with clear tasks — keep graphics and stories school-appropriate.
          </p>
          <KellyAccentCutout src={KELLY_ACCENT_YOUTH_OUTREACH} />
        </div>
      </section>

      <nav
        aria-label="Youth Outreach sections"
        className="sticky top-2 z-10 flex flex-wrap gap-2 rounded-xl border border-kelly-text/10 bg-white/95 p-3 shadow-sm backdrop-blur-sm"
      >
        {SECTION_NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-lg border border-kelly-navy/15 bg-kelly-page px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog md:text-xs"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="youth-overview" className="scroll-mt-28 space-y-4">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Overview</h2>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 font-mono text-xs leading-relaxed text-kelly-deep">
          {YOUTH_REPORTING_HIERARCHY_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Youth Outreach Lead — responsibilities</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.leadResponsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Student-friendly task framing</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.taskFraming.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-gold/35 bg-kelly-gold/[0.08] p-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-deep">Monthly rhythm</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.monthlyRhythm.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="youth-cross-campus" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.05] p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Cross-campus recruitment</h2>
        <p className="font-body text-sm font-semibold text-kelly-deep">{y.crossCampusDoctrine}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">College students often know</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.crossCampusCollegeNetworks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">High school students often know</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.crossCampusHighSchoolNetworks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-kelly-navy/20 bg-white px-4 py-3">
          <p className="font-body text-xs font-bold uppercase text-kelly-navy">Weekly task</p>
          <p className="mt-2 font-body text-sm font-semibold text-kelly-deep">{y.weeklyCrossCampusTask}</p>
          <div className="mt-3">
            <CopyTextButton text={y.weeklyCrossCampusTask} label="Copy task" />
          </div>
        </div>
        <p className="font-body text-xs text-kelly-text/70">
          Coordinate with <span className="font-semibold text-kelly-navy">Events</span> on joint stops —{" "}
          <Link href={`/dashboard/team/${teamSlug}/events`} className="font-semibold text-kelly-blue underline">
            Events tab
          </Link>
          .
        </p>
      </section>

      <section id="youth-naming" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">School-based team naming</h2>
        <p className="font-body text-sm text-kelly-text/85">{y.schoolTeamNamingFormat}</p>
        <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Examples</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {y.schoolTeamNamingExamples.map((ex) => (
            <li key={ex} className="font-mono text-sm">
              {ex}
            </li>
          ))}
        </ul>
      </section>

      <section id="youth-campus-map" className="scroll-mt-28 space-y-4">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Campus map</h2>
        <p className="font-body text-sm text-kelly-text/80">
          Track high schools, colleges, trade schools, orgs, leaders, and registration moments — demo rows below; production
          wire to your data model.
        </p>
        <div className="overflow-x-auto rounded-xl border border-kelly-text/10">
          <table className="min-w-full divide-y divide-kelly-text/10 font-body text-sm">
            <thead className="bg-kelly-fog/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Campus</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Student team name</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Type</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Status</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Lead track</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-kelly-text/55">Orgs / notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kelly-text/10 bg-white">
              {y.campuses.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 font-semibold text-kelly-deep">{c.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-kelly-navy">{c.studentTeamDisplayName ?? "—"}</td>
                  <td className="px-3 py-2 text-kelly-text/80">{kindLabel(c.kind)}</td>
                  <td className="px-3 py-2 text-kelly-text/80">{statusLabel(c.status)}</td>
                  <td className="px-3 py-2 text-kelly-text/80">{c.leadTrack?.replace(/-/g, " ") ?? "—"}</td>
                  <td className="max-w-xs px-3 py-2 text-xs text-kelly-text/75">
                    {[c.studentOrganizations, c.leadDisplayLabel, c.registrationNotes].filter(Boolean).join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="youth-scoreboard" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Youth scoreboard and recognition</h2>
        <p className="font-body text-sm text-kelly-text/80">
          Gamification keeps momentum honest — celebrate launches and cross-campus courage, not spam volume.
        </p>
        <div className="rounded-xl border border-kelly-gold/35 bg-white px-4 py-3">
          <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Current level (demo)</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">{y.recognitionLevelCurrent}</p>
          <p className="mt-2 font-body text-xs text-kelly-text/65">Ladder: {y.recognitionLevels.join(" → ")}</p>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Live metrics</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {y.scoreboardMetrics.map((m) => (
              <div key={m.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
                <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">{m.label}</dt>
                <dd className="mt-1 font-mono text-lg font-bold text-kelly-navy">
                  {m.value}
                  {m.target != null ? <span className="text-xs font-normal text-kelly-text/55"> / {m.target}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Badges</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {y.badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-lg border px-3 py-2 font-body text-sm ${
                  b.earned ? "border-kelly-success/40 bg-kelly-success/[0.08]" : "border-kelly-text/15 bg-kelly-fog/40 opacity-80"
                }`}
              >
                <span className="font-semibold text-kelly-deep">{b.earned ? "●" : "○"}</span> {b.label}
                {b.description ? <p className="mt-1 text-xs text-kelly-text/70">{b.description}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="youth-challenges" className="scroll-mt-28 space-y-3 rounded-2xl border-2 border-kelly-gold/40 bg-kelly-gold/[0.07] p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Cross-campus challenges</h2>
        <p className="font-body text-sm text-kelly-text/80">Pick one challenge at a time — post proof in your weekly youth huddle (no PII in screenshots).</p>
        <ul className="space-y-3">
          {y.challenges.map((ch) => (
            <li key={ch.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3 shadow-sm">
              <p className="font-heading text-sm font-bold text-kelly-navy">{ch.title}</p>
              {ch.detail ? <p className="mt-1 font-body text-sm text-kelly-text/80">{ch.detail}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="youth-events" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Student events and Kelly visits</h2>
        <p className="font-body text-sm font-semibold text-kelly-deep">{YOUTH_EVENT_DOCTRINE}</p>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Creative gatherings</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {y.creativeStudentEventExamples.map((e) => (
              <span key={e} className="rounded-full border border-kelly-text/15 bg-kelly-page px-3 py-1 font-body text-xs text-kelly-deep">
                {e}
              </span>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-navy">Kelly on campus</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.kellyStudentVisitGuidance.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Request Kelly visit — checklist</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.kellyVisitRequestBullets.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <a
            href={visitHref}
            className="mt-4 inline-flex rounded-lg bg-kelly-navy px-4 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep"
          >
            Request Kelly visit (email)
          </a>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4">
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">City ↔ student coordination</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
            {y.cityStudentCoordination.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <section className="rounded-xl border border-kelly-text/15 bg-kelly-fog/40 p-4">
          <h3 className="font-heading text-sm font-bold text-kelly-navy">County Clerk visit (county seat)</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">{y.countyClerkIntro}</p>
          <ul className="mt-3 space-y-2">
            {y.countyClerkVisits.map((row) => (
              <li key={row.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
                <p className="font-body text-sm font-semibold text-kelly-deep">{row.countySeatLabel}</p>
                <p className="font-body text-xs text-kelly-text/70">{clerkStatusLabel(row.status)}</p>
                {row.notes ? <p className="mt-1 font-body text-xs text-kelly-text/65">{row.notes}</p> : null}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-body text-xs text-kelly-text/65">
            Events lane also carries county-seat logistics — mirror this checklist on the{" "}
            <Link href={`/dashboard/team/${teamSlug}/events`} className="font-semibold text-kelly-blue underline">
              Events tab
            </Link>
            .
          </p>
        </section>
      </section>

      <section id="youth-immersion" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-deep/20 bg-kelly-page/90 p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Immersion visit model</h2>
        <p className="font-body text-sm font-semibold text-kelly-deep">{y.immersionWeeklyTarget}</p>
        <p className="font-body text-sm text-kelly-text/85">{y.immersionTypicalStructure}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Day 1</p>
            <ul className="mt-2 list-decimal space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.immersionDayOne.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Day 2</p>
            <ul className="mt-2 list-decimal space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.immersionDayTwo.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="youth-high-school" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">High school program</h2>
        <p className="font-body text-sm text-kelly-text/80">
          Prefer graduating juniors/senior-level leaders where appropriate; keep parent- and school-appropriate engagement.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Focus</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.highSchoolFocus.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Tasks</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.highSchoolTasks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="youth-college" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">College program</h2>
        <p className="font-body text-sm text-kelly-text/80">One college lead covers universities, trade schools, and community colleges in the footprint.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Focus</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.collegeFocus.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Tasks</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {y.collegeTasks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="youth-team-builder" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.03] p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Student team builder</h2>
        <p className="font-body text-sm font-semibold text-kelly-deep">{y.studentTeamRule}</p>
        <p className="font-body text-sm text-kelly-text/80">
          Student-led teams mirror the adult triad so Events, Social, and P5/VR stay balanced. Start with one student; they
          invite two peers; launch when all three lanes are covered.
        </p>
        <Link
          href={`/dashboard/team/${teamSlug}/power-of-5`}
          className="inline-flex rounded-lg border border-kelly-navy/30 bg-white px-3 py-2 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
        >
          Placement queue (students → downstream)
        </Link>
      </section>

      <section id="youth-social" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Social recruitment</h2>
        <p className="font-body text-sm text-kelly-text/80">Primary recruitment surface for students — short posts, stories/reels, and peer invites to /volunteer.</p>
        <ul className="list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {y.socialRecruitmentTasks.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section id="youth-registration" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Registration drives</h2>
        <p className="font-body text-sm text-kelly-text/80">
          Coordinate with P5/VR for tables, digital pushes, and semester windows. Pair every outreach event with a registration
          moment when possible.
        </p>
        <ul className="list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {y.placementNotes.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section id="youth-metrics" className="scroll-mt-28 space-y-4">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Metrics</h2>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Geographic / regional roll-up (demo)</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {y.geographicKpis.map((k) => (
              <div key={k.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
                <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">{k.label}</dt>
                <dd className="mt-1 font-mono text-lg font-bold text-kelly-navy">
                  {k.value}
                  {k.target != null ? <span className="text-xs font-normal text-kelly-text/55"> / {k.target}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Per campus targets</p>
          <ul className="mt-2 space-y-2">
            {y.campusTargetKpis.map((row) => (
              <li key={row.label} className="flex flex-wrap justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2 font-body text-sm">
                <span className="font-semibold text-kelly-deep">{row.label}</span>
                <span className="text-kelly-text/80">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="youth-twenty" className="scroll-mt-28 space-y-4 rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Youth 20-square metrics</h2>
        <p className="font-body text-sm text-kelly-text/75">
          Same ■/□ convention as the team Overview — 5% per square. Values derive from Youth KPI progress (demo).
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {y.twentySquareYouthMetrics.map((m) => (
            <TwentySquareProgress key={m.id} label={m.label} percent={m.percent} />
          ))}
        </div>
      </section>

      <section id="youth-resources" className="scroll-mt-28 space-y-3">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Resources</h2>
        <p className="font-body text-sm text-kelly-text/80">
          Guides, checklists, and templates live in the volunteer library — expand with campus-specific counsel review.
        </p>
        <Link href="/volunteer/resources/youth-outreach" className="font-body text-sm font-semibold text-kelly-blue underline">
          Open Youth Outreach resource hub
        </Link>
      </section>

      <section id="youth-messaging" className="scroll-mt-28 space-y-3 rounded-2xl border border-kelly-success/25 bg-kelly-success/[0.06] p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Messaging</h2>
        <p className="font-body text-sm text-kelly-text/80">Themes for student-facing copy (stay factual; escalate policy questions).</p>
        <ul className="space-y-2">
          {y.messagingThemes.map((t) => (
            <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-white px-3 py-2 font-body text-sm text-kelly-text/85">
              {t}
              <CopyTextButton text={t} label="Copy" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
