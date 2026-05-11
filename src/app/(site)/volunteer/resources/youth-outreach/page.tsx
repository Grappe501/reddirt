import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import {
  YOUTH_CHALLENGES_SEED,
  YOUTH_COLLEGE_FOCUS,
  YOUTH_COLLEGE_TASKS,
  YOUTH_CROSS_CAMPUS_DOCTRINE,
  YOUTH_EVENT_DOCTRINE,
  YOUTH_HS_FOCUS,
  YOUTH_HS_TASKS,
  YOUTH_IMMERSION_DAY1,
  YOUTH_IMMERSION_DAY2,
  YOUTH_IMMERSION_STRUCTURE,
  YOUTH_IMMERSION_WEEKLY,
  YOUTH_MESSAGING_THEMES,
  YOUTH_MONTHLY_RHYTHM,
  YOUTH_RECOGNITION_LEVELS,
  YOUTH_REPORTING_HIERARCHY_LINES,
  YOUTH_SOCIAL_TASKS,
  YOUTH_CAMPUS_TEAM_RULE,
} from "@/lib/volunteer-ops/youth-outreach-workspace";
import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export const metadata: Metadata = {
  title: "Youth Outreach (P5/VR) · Volunteer resources",
  description:
    "Formal Youth Outreach sub-lane under Power of 5 / Voter Registration: campus triads, student registration, social recruitment.",
};

function StubSection({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/80">{body}</p>
      <p className="mt-3 rounded-lg bg-kelly-gold/15 px-3 py-2 font-body text-xs font-semibold text-kelly-deep">
        Full asset in production backlog — use your team dashboard Youth (P5/VR) tab for live checklists today.
      </p>
    </section>
  );
}

export default function YouthOutreachResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteers · P5/VR"
        title="Youth Outreach"
        subtitle="A formal lane under Power of 5 / Voter Registration at every level — student registration, relational turnout, campus 3-person teams, and social-first recruitment."
      >
        <Button href="/volunteer/resources" variant="outline">
          Resource library
        </Button>
        <Button href={`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}/youth-outreach`} variant="outline">
          Demo team · Youth tab
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-8">
          <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6">
            <p className="font-body text-xs font-bold uppercase text-kelly-text/55">Reporting</p>
            <div className="mt-2 font-mono text-xs leading-relaxed text-kelly-deep">
              {YOUTH_REPORTING_HIERARCHY_LINES.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <p className="mt-4 font-body text-sm text-kelly-text/85">{YOUTH_CAMPUS_TEAM_RULE}</p>
          </section>

          <section id="cross-campus" className="scroll-mt-28 rounded-2xl border border-kelly-blue/20 bg-kelly-blue/[0.04] p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Cross-Campus Recruitment Playbook</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">{YOUTH_CROSS_CAMPUS_DOCTRINE}</p>
            <p className="mt-3 font-body text-sm font-semibold text-kelly-deep">
              Weekly task: invite one student at another school to start a campus team.
            </p>
          </section>

          <section id="gamification" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Student Gamification Guide</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/80">
              Recognition ladder: {YOUTH_RECOGNITION_LEVELS.join(" → ")}. Pair points with honest registration tracking — see
              your team dashboard Youth tab for the live scoreboard demo.
            </p>
          </section>

          <section id="challenges" className="scroll-mt-28 rounded-2xl border border-kelly-gold/30 bg-kelly-gold/[0.08] p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Campus Challenge Toolkit</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {YOUTH_CHALLENGES_SEED.map((c) => (
                <li key={c.id}>
                  <span className="font-semibold text-kelly-deep">{c.title}</span>
                  {c.detail ? ` — ${c.detail}` : ""}
                </li>
              ))}
            </ul>
          </section>

          <section id="kelly-campus" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Kelly Campus Visit Planner</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">{YOUTH_EVENT_DOCTRINE}</p>
            <p className="mt-3 font-body text-sm text-kelly-text/80">
              Use the Youth tab “Request Kelly visit” action on your team dashboard to email structured details to campaign ops.
            </p>
          </section>

          <section id="immersion" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Two-Day Immersion Planner</h2>
            <p className="mt-2 font-body text-sm font-semibold text-kelly-deep">{YOUTH_IMMERSION_WEEKLY}</p>
            <p className="mt-2 font-body text-sm text-kelly-text/85">{YOUTH_IMMERSION_STRUCTURE}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Day 1</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_IMMERSION_DAY1.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Day 2</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_IMMERSION_DAY2.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <StubSection
            id="county-clerk"
            title="County Clerk Visit Checklist"
            body="Contacted → visit requested → scheduled → completed → follow-up notes. Coordinate with Events whenever Kelly is in a county seat."
          />

          <StubSection
            id="campus-launch"
            title="Campus Team Launch Guide"
            body="Step-by-step for the student triad launch — Events, Social, P5/VR — starting from one motivated student."
          />
          <section id="high-school" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">High School Outreach Guide</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Focus</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_HS_FOCUS.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Tasks</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_HS_TASKS.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <section id="college" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">College Outreach Guide</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Focus</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_COLLEGE_FOCUS.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Tasks</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                  {YOUTH_COLLEGE_TASKS.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <StubSection
            id="registration"
            title="Student Registration Drive Checklist"
            body="Coordinate with your P5/VR lead for tables, digital pushes, and semester timing."
          />
          <section id="social" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Student Social Media Playbook</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {YOUTH_SOCIAL_TASKS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section id="semester" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Semester Planning Calendar</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {YOUTH_MONTHLY_RHYTHM.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
          <StubSection
            id="parents"
            title="Parent Communication Guidance"
            body="School-appropriate touchpoints; legal/comms review for any engagement with minors."
          />
          <section id="talking-points" className="scroll-mt-28 rounded-2xl border border-kelly-success/25 bg-kelly-success/[0.06] p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Campus Talking Points</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
              {YOUTH_MESSAGING_THEMES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="mt-4 font-body text-xs text-kelly-text/65">
              Also see{" "}
              <Link href="/volunteer/resources/messaging" className="font-semibold text-kelly-blue underline">
                general messaging library
              </Link>
              .
            </p>
          </section>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
