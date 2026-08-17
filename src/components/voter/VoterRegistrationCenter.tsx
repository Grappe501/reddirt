import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { getArVoterRegistrationLookupUrl } from "@/lib/county/official-links";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/types";
import { voterRegistrationCopy } from "@/i18n/pages/voter-registration";
import { withLocaleHref } from "@/i18n/path";

const card =
  "rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-elevated";

export function VoterRegistrationCenter({ locale = "en" }: { locale?: AppLocale }) {
  const officialUrl = getArVoterRegistrationLookupUrl();

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow={voterRegistrationCopy("eyebrow", locale)}
        title={voterRegistrationCopy("title", locale)}
        subtitle={voterRegistrationCopy("subtitle", locale)}
      >
        <Button href={officialUrl} variant="primary">
          {voterRegistrationCopy("openVoterView", locale)}
        </Button>
      </PageHero>

      <FullBleedSection padY className="border-b border-kelly-text/10 bg-kelly-page" aria-labelledby="paper-title">
        <ContentContainer>
          <h2 className="font-heading text-xl font-bold text-kelly-text" id="paper-title">
            {voterRegistrationCopy("paperTitle", locale)}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/85">
            {voterRegistrationCopy("paperLead", locale)}
          </p>
          <div className="mt-5">
            <Button href={withLocaleHref("/get-involved#join", locale)} variant="outline">
              {voterRegistrationCopy("askOutreach", locale)}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-wash" aria-labelledby="voter-ed-hub-title">
        <ContentContainer>
          <SectionHeading
            id="voter-ed-hub-title"
            align="left"
            eyebrow={voterRegistrationCopy("hubEyebrow", locale)}
            title={voterRegistrationCopy("hubTitle", locale)}
            subtitle={voterRegistrationCopy("hubSubtitle", locale)}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className={cn(card, "bg-white")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">
                {voterRegistrationCopy("cardDates", locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                {voterRegistrationCopy("cardDatesBody", locale)}
              </p>
            </div>
            <div className={cn(card, "bg-kelly-page")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">
                {voterRegistrationCopy("cardBallot", locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                {voterRegistrationCopy("cardBallotBody", locale)}
              </p>
            </div>
            <div className={cn(card, "bg-white")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">
                {voterRegistrationCopy("cardHow", locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                {voterRegistrationCopy("cardHowBody", locale)}
              </p>
            </div>
            <div className={cn(card, "bg-kelly-page")}>
              <h3 className="font-heading text-base font-bold text-kelly-text">
                {voterRegistrationCopy("cardTrust", locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                {voterRegistrationCopy("cardTrustBody", locale)}
              </p>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
