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
        subtitle="Kelly believes endorsements should be earned through listening, service, and trust. Attendance, a friendly photograph, or a meeting is not an endorsement."
      >
        <Button href="/about" variant="outline">
          Read About Kelly’s Experience
        </Button>
        <Button href="/get-involved" variant="primary">
          Join the Campaign
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          {CONFIRMED_ENDORSEMENTS.length === 0 ? (
            <div className="rounded-card border border-kelly-ink/15 bg-kelly-fog/40 px-6 py-10 text-center md:px-10">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink">
                Earned support, published when confirmed
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
                As organizations and community leaders formally announce their support, you will find them here—with the
                exact organization name, approved wording, and source on record.
              </p>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
                Until then, this page stays empty on purpose. We will not invent logos or imply endorsements that are not
                yet confirmed.
              </p>
              <p className="mt-6 font-body text-sm text-kelly-muted">
                Labor, civic, and community organizations are not named as endorsers until that confirmation exists.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {CONFIRMED_ENDORSEMENTS.map((item) => (
                <li key={item.id} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-[var(--shadow-soft)]">
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
                      className="mt-4 inline-flex text-sm font-semibold text-kelly-blue underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
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
