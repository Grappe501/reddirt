import Link from "next/link";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import {
  CANVASSING_DOOR_SCRIPT,
  CANVASSING_FIELD_RULES,
  CANVASSING_ISSUES,
  CANVASSING_LEAD_TRAINER,
  CANVASSING_TRAINING_SCHEDULE,
  CANVASSING_TRAINING_STEPS,
} from "@/content/volunteer/canvassing";

export function CanvassingHubContent() {
  return (
    <>
      <FullBleedSection padY variant="default" aria-labelledby="canvassing-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="canvassing-heading"
            align="left"
            eyebrow="Volunteer training"
            title="Canvassing"
            subtitle="Listen-first doors, Sela Moser's clipboard sheet, and Kelly's stance on the five issues neighbors name most often."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/volunteer/resources/canvassing/clipboard-sheet" variant="primary">
              Download clipboard sheet
            </Button>
            <Button href="/get-involved#volunteer" variant="outline">
              Volunteer signup
            </Button>
            <Button href="/volunteer/resources" variant="outline">
              Resource library
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl">
          <div className="rounded-2xl border border-kelly-gold/35 bg-kelly-navy/[0.04] p-6 md:p-8">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Lead trainer</p>
            <p className="mt-2 font-heading text-xl font-bold text-kelly-ink">{CANVASSING_LEAD_TRAINER.name}</p>
            <p className="mt-1 font-body text-sm font-semibold text-kelly-slate">{CANVASSING_LEAD_TRAINER.role}</p>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{CANVASSING_LEAD_TRAINER.note}</p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading align="left" as="h2" eyebrow="Field flow" title="How a canvassing shift works" />
          <ol className="mt-8 space-y-4">
            {CANVASSING_TRAINING_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] md:p-6"
              >
                <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">
                  Step {i + 1} · {step.title}
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{step.body}</p>
              </li>
            ))}
          </ol>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="flex max-w-3xl flex-col gap-6">
          <SectionHeading align="left" as="h2" eyebrow="Script" title="Door conversation" />
          {Object.entries(CANVASSING_DOOR_SCRIPT).map(([key, text]) => (
            <section
              key={key}
              className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-heading text-lg font-bold capitalize text-kelly-navy">{key.replace(/_/g, " ")}</h3>
                <CopyTextButton text={text} label="Copy" />
              </div>
              <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-kelly-text/85">{text}</p>
            </section>
          ))}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            align="left"
            as="h2"
            eyebrow="Clipboard issues"
            title="Kelly's stance — training drill-downs"
            subtitle="One–two sentences for doors, plus deeper notes on each issue page. Stay honest about what the Secretary of State's office can do."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {CANVASSING_ISSUES.map((issue) => (
              <li key={issue.slug}>
                <Link
                  href={`/volunteer/resources/canvassing/${issue.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-kelly-navy/30 hover:shadow-md"
                >
                  <p className="font-body text-xs font-bold text-kelly-gold">{issue.number}.</p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy group-hover:text-kelly-blue">
                    {issue.label}
                  </h3>
                  <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate line-clamp-4">
                    {issue.kellyStance}
                  </p>
                  <p className="mt-4 text-sm font-bold text-kelly-blue group-hover:underline">Open training page →</p>
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl">
          <SectionHeading align="left" as="h2" eyebrow="Safety" title="Field rules" />
          <ul className="mt-6 space-y-3">
            {CANVASSING_FIELD_RULES.map((rule) => (
              <li
                key={rule}
                className="rounded-lg border border-kelly-text/10 bg-white px-4 py-3 font-body text-sm text-kelly-text/85"
              >
                {rule}
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading align="left" as="h2" eyebrow="Schedule" title={CANVASSING_TRAINING_SCHEDULE.heading} />
          <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
            {CANVASSING_TRAINING_SCHEDULE.intro}
          </p>
          {CANVASSING_TRAINING_SCHEDULE.events.length === 0 ? (
            <div
              role="status"
              className="mt-8 rounded-xl border border-dashed border-kelly-navy/25 bg-kelly-navy/[0.03] px-6 py-8 text-center"
            >
              <p className="font-body text-sm text-kelly-slate">No trainings posted yet — check back soon.</p>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {CANVASSING_TRAINING_SCHEDULE.events.map((ev) => (
                <li key={ev.dateLabel} className="rounded-xl border border-kelly-text/10 bg-white p-5">
                  <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{ev.dateLabel}</p>
                  <p className="mt-1 font-heading text-lg font-bold text-kelly-ink">{ev.title}</p>
                  <p className="mt-1 font-body text-sm text-kelly-slate">{ev.location}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
