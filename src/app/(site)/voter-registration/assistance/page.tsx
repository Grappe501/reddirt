import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { getArVoterRegistrationLookupUrl } from "@/lib/county/official-links";

export const metadata: Metadata = {
  title: "Campaign assistance lookup",
  robots: { index: false, follow: true },
};

export default function VoterAssistancePreviewPage() {
  const official = getArVoterRegistrationLookupUrl();
  return (
    <>
      <PageHero
        eyebrow="Preview"
        title="Campaign assistance lookup"
        subtitle="This route reserves space for a volunteer-facing or voter-facing flow that uses the campaign’s copy of the voter file. It is not the Secretary of State’s live system and will ship with compliance copy and rate limits."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          <div className="rounded-2xl border border-amber-700/30 bg-amber-50/90 p-6 text-sm text-deep-soil/90">
            <p className="font-bold text-amber-950">Not built yet</p>
            <p className="mt-2 leading-relaxed">
              When ready, this page will host a structured search (e.g. name + date of birth + county) against our
              warehouse tables, with every result labeled as <strong>campaign assistance data</strong> and a mandatory
              link to{" "}
              <a className="font-semibold text-red-dirt underline" href={official} target="_blank" rel="noreferrer">
                Arkansas VoterView
              </a>{" "}
              for official confirmation.
            </p>
          </div>
          <p className="mt-6 text-sm text-deep-soil/75">
            For now, use the{" "}
            <Link className="font-semibold text-red-dirt underline-offset-2 hover:underline" href="/voter-registration">
              voter registration center
            </Link>{" "}
            and request a human through{" "}
            <Link className="font-semibold text-red-dirt underline-offset-2 hover:underline" href="/get-involved#join">
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
