import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";

export const metadata: Metadata = {
  title: "Conversational Spanish · Community region (scaffold)",
  description: "Placeholder for the conversational Spanish community region dashboard — follows Muslim Community shell pattern.",
};

export default function ConversationalSpanishRegionScaffoldPage() {
  return (
    <>
      <PageHero
        eyebrow="Community region · scaffold"
        title="Conversational Spanish region"
        subtitle="Architecture will mirror the Muslim Community dashboard: Overview, P5/VR, Events, Social, Youth, Women's outreach modules, resources, messages, and rollup — with Spanish-first content packs."
      >
        <Button href="/dashboard/community/muslim" variant="outline">
          Muslim Community (reference)
        </Button>
        <Button href="/dashboard/community" variant="outline">
          All community regions
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-2xl space-y-4">
          <p className="font-body text-sm text-kelly-text/85">
            This route reserves URL space and product expectations for the next community region after the Muslim Community
            dashboard reaches partner-ready quality. No lane data is wired yet.
          </p>
          <p className="font-body text-sm text-kelly-text/75">
            Docs:{" "}
            <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
              Volunteer resources
            </Link>
            · campaign-ops community equity master plan in repo.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
