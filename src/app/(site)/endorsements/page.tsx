import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Endorsements",
  description:
    "Confirmed endorsements for Kelly Grappe’s campaign for Arkansas Secretary of State. Only verified organizations and wording appear here.",
  path: "/endorsements",
});

/** Confirmed endorsement records only — empty until campaign record confirms each entry. */
const CONFIRMED_ENDORSEMENTS: Array<{
  id: string;
  organization: string;
  summary: string;
  dateLabel?: string;
  sourceHref?: string;
  sourceLabel?: string;
}> = [];

export default function EndorsementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Endorsements"
        subtitle="Endorsements matter when they reflect real relationships and shared values—not logo wallpaper. Attendance, a friendly photograph, or a meeting is not an endorsement."
      >
        <Button href="/about" variant="outline">
          Read Kelly’s Story
        </Button>
        <Button href="/get-involved" variant="primary">
          Join the Campaign
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          {CONFIRMED_ENDORSEMENTS.length === 0 ? (
            <div className="rounded-card border border-dashed border-kelly-ink/20 bg-kelly-fog/50 px-6 py-10 text-center">
              <p className="font-body text-base leading-relaxed text-kelly-slate">
                No endorsements are listed yet. As organizations confirm support in the campaign record—with the exact
                organization name, endorsement status, and approved wording—their statements will be published here with
                sources.
              </p>
              <p className="mt-4 font-body text-sm text-kelly-muted">
                Labor, civic, and community organizations are not named as endorsers until that confirmation exists.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {CONFIRMED_ENDORSEMENTS.map((item) => (
                <li key={item.id} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
                  <h2 className="font-heading text-xl font-bold text-kelly-navy">{item.organization}</h2>
                  {item.dateLabel ? (
                    <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wide text-kelly-gold">
                      {item.dateLabel}
                    </p>
                  ) : null}
                  <p className="mt-3 font-body text-base text-kelly-slate">{item.summary}</p>
                  {item.sourceHref && item.sourceLabel ? (
                    <a
                      href={item.sourceHref}
                      className="mt-4 inline-flex text-sm font-semibold text-kelly-blue underline-offset-4 hover:underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.sourceLabel}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
