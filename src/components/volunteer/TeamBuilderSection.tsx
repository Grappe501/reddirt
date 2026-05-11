import type { ReactNode } from "react";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";

import { TeamBuilderChecklist } from "./TeamBuilderChecklist";
import { TeamLevelCard } from "./TeamLevelCard";

const NUMBERED_FLOW = [
  "I will start.",
  "I will recruit one more person.",
  "We will look at volunteer signups and our own networks.",
  "We will recruit two people to cover the missing lanes.",
  "We will define our geography.",
  "We will choose our upstream contact.",
  "We will begin weekly tasks.",
  "We will help launch the next downstream team.",
] as const;

function StepCard({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] md:p-6 print:break-inside-avoid">
      <div className="flex items-start gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kelly-navy font-heading text-sm font-bold text-white"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold text-kelly-navy md:text-lg">{title}</h3>
          <div className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function TeamBuilderSection() {
  return (
    <ContentContainer className="max-w-4xl">
      <SectionHeading
        id="build-three-person-team-heading"
        align="left"
        eyebrow="Section 2"
        title="How to build a 3-person team"
        subtitle="The model does not start with three people. It starts with one person willing to take the first step."
      />

      {/* Visual: simple horizontal flow on md+ */}
      <div className="mt-10 space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <StepCard step={1} title="Start with one person">
            <p>
              Every team starts with one person willing to take the first step. That person does not need to have all the
              answers. Their first job is simple: <strong>recruit one more person.</strong>
            </p>
          </StepCard>
          <div
            className="hidden items-center justify-center font-body text-2xl font-bold text-kelly-gold/80 md:flex"
            aria-hidden
          >
            →
          </div>
          <StepCard step={2} title="Recruit the second person">
            <p>
              The first two people become the <strong>starting pair</strong>. They put their heads together, look at who has
              already signed up to volunteer, and identify people who may fit the missing roles.
            </p>
          </StepCard>
          <div
            className="hidden items-center justify-center font-body text-2xl font-bold text-kelly-gold/80 md:flex"
            aria-hidden
          >
            →
          </div>
          <StepCard step={3} title="Recruit two more people">
            <p>
              The starting pair recruits two more people so the team has coverage for the three lanes:{" "}
              <strong>Events</strong>, <strong>Social Media</strong>, and <strong>Power of 5 / Voter Registration</strong>.
            </p>
            <p className="mt-3 rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] p-3 text-kelly-deep">
              <strong className="font-semibold">Important note:</strong> The original recruiter becomes the{" "}
              <strong>campaign upstream contact</strong> for that team. They are responsible for helping information move{" "}
              <strong>up to the campaign</strong> and <strong>back down</strong> to the local team.
            </p>
          </StepCard>
        </div>
        <p className="text-center font-body text-xs text-kelly-text/55 md:hidden" aria-hidden>
          One person → pair → full three-lane team
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-kelly-text/10 bg-kelly-text/[0.03] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Build geographically</h3>
        <p className="mt-3 font-body text-base font-semibold text-kelly-deep">All teams must be geographic in nature.</p>
        <ul className="mt-4 list-disc space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          <li>If the three people are from different cities in the same county, they are a <strong>county team</strong>.</li>
          <li>If the three people are from the same city, they are a <strong>city team</strong>.</li>
          <li>
            If the three people are from the same precinct, neighborhood, campus, church community, or local area, they are
            a <strong>local team</strong>.
          </li>
        </ul>
        <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85">
          The <strong>more local</strong> the team is, the <strong>more powerful</strong> the organizing becomes.
        </p>
      </div>

      <div className="mt-10">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Build downstream teams</h3>
        <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/85">
          Every team&apos;s job is not to become bigger. Every team&apos;s job is to <strong>help build more teams</strong>.
        </p>
        <p className="mt-4 rounded-xl border-2 border-kelly-gold/50 bg-kelly-gold/10 px-4 py-3 text-center font-heading text-base font-bold text-kelly-navy md:text-lg">
          More teams, not bigger teams.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          <li>A county team helps launch city teams.</li>
          <li>A city team helps launch precinct or neighborhood teams.</li>
          <li>A precinct team helps launch block, apartment, campus, or community teams.</li>
          <li>There can be multiple teams at every level.</li>
          <li>Teams should <strong>multiply</strong> instead of expanding into large, hard-to-manage groups.</li>
        </ul>
      </div>

      <div className="mt-12">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Team levels</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/70">Same three lanes at every level — geography decides which level you are.</p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TeamLevelCard
            title="County team"
            bestWhen="Members are spread across multiple cities in the same county."
            primaryJob="Launch city teams."
          />
          <TeamLevelCard
            title="City team"
            bestWhen="Members are in the same town or city."
            primaryJob="Launch precinct, neighborhood, campus, or community teams."
          />
          <TeamLevelCard
            title="Precinct team"
            bestWhen="Members are in the same precinct or voting area."
            primaryJob="Organize voter contact and local relationships."
          />
          <TeamLevelCard
            title="Neighborhood / block / community team"
            bestWhen="Members share a very local area or natural community."
            primaryJob="Relational organizing, event turnout, and voter registration support."
          />
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-kelly-navy/15 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Recommended simple flow</h3>
        <ol className="mt-6 list-decimal space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/90">
          {NUMBERED_FLOW.map((line) => (
            <li key={line} className="pl-1">
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10">
        <TeamBuilderChecklist />
      </div>

      <div className="mt-10 rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">The rule of three</h3>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">
          A team should stay <strong>small enough to move quickly</strong>. If more people want to help, that is a win —
          but the next step is to <strong>launch another team</strong>, not make the original team bigger.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-kelly-text/10 bg-kelly-fog/40 p-6 italic md:p-8">
        <h3 className="font-heading text-lg font-bold not-italic text-kelly-navy">Example</h3>
        <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/90 not-italic">
          Sarah signs up in Creek County. She asks Marcus to help her start. Sarah and Marcus review volunteer signups and
          realize they need someone who likes events and someone who is comfortable posting online. They recruit Dana for
          Events and Luis for Social Media. Sarah stays the upstream contact. Because the team members live in different
          towns, they are a county team. Their first goal is not to grow to ten people.&nbsp;Their first goal is to help
          Sapulpa, Bristow, and Drumright each start their own 3-person city team.
        </p>
      </div>
    </ContentContainer>
  );
}
