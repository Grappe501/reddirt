import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import type { CanvassingIssue } from "@/content/volunteer/canvassing";

export function CanvassingIssueContent({ issue }: { issue: CanvassingIssue }) {
  const copyBundle = [
    `Kelly on ${issue.label} (doors):`,
    issue.kellyStance,
    "",
    "Bridge:",
    issue.doorBridge,
    "",
    "Talk points:",
    ...issue.talkPoints.map((p) => `• ${p}`),
  ].join("\n");

  return (
    <>
      <FullBleedSection padY variant="default">
        <ContentContainer className="max-w-3xl">
          <nav className="font-body text-sm text-kelly-slate">
            <Link href="/volunteer/resources/canvassing" className="font-semibold text-kelly-navy hover:underline">
              ← Canvassing training
            </Link>
          </nav>
          <SectionHeading
            className="mt-6"
            align="left"
            eyebrow={`Clipboard issue ${issue.number}`}
            title={issue.label}
            subtitle="Use at the door after a neighbor picks this issue on the clipboard sheet."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <CopyTextButton text={copyBundle} label="Copy all talking points" />
            {issue.planHref ? (
              <Button href={issue.planHref} variant="outline">
                Read in My Plan
              </Button>
            ) : null}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="flex max-w-3xl flex-col gap-6">
          <section className="rounded-2xl border border-kelly-gold/30 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">Kelly&apos;s stance (1–2 sentences)</h2>
              <CopyTextButton text={issue.kellyStance} label="Copy stance" />
            </div>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/90">{issue.kellyStance}</p>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">Door bridge</h2>
              <CopyTextButton text={issue.doorBridge} label="Copy bridge" />
            </div>
            <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85">{issue.doorBridge}</p>
          </section>

          <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Training drill-down</h2>
            <ul className="mt-4 space-y-3">
              {issue.talkPoints.map((point) => (
                <li
                  key={point.slice(0, 48)}
                  className="rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-sm leading-relaxed text-kelly-text/85"
                >
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-6 md:p-8">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">What the SOS office can (and can&apos;t) do</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{issue.officeScope}</p>
          </section>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

export function assertCanvassingIssue(slug: string, issue: CanvassingIssue | undefined): CanvassingIssue {
  if (!issue) notFound();
  return issue;
}
