import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { getArVoterRegistrationLookupUrl } from "@/lib/county/official-links";

export const metadata: Metadata = {
  title: "Voter registration help",
  robots: { index: false, follow: true },
};

export default function VoterAssistancePreviewPage() {
  const official = getArVoterRegistrationLookupUrl();
  return (
    <>
      <PageHero
        eyebrow="Voters"
        title="Voter registration help"
        subtitle="For official registration status, use Arkansas VoterView. The campaign can also connect you with a volunteer when you need a hand."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          <p className="font-body text-sm leading-relaxed text-kelly-text/85">
            Check your registration on{" "}
            <a className="font-semibold text-kelly-navy underline" href={official} target="_blank" rel="noreferrer">
              Arkansas VoterView
            </a>
            , or start from our{" "}
            <Link className="font-semibold text-kelly-navy underline-offset-2 hover:underline" href="/voter-registration">
              voter registration center
            </Link>
            . To request a human follow-up, use{" "}
            <Link className="font-semibold text-kelly-navy underline-offset-2 hover:underline" href="/get-involved#join">
              get involved
            </Link>
            .
          </p>
          <Button href="/voter-registration" variant="primary" className="mt-6">
            Back to voter center
          </Button>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
