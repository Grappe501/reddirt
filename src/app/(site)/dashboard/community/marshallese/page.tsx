import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";

export const metadata: Metadata = {
  title: "Marshallese · Community region (scaffold)",
  description: "Placeholder for the Marshallese community region dashboard — follows Muslim Community shell pattern.",
};

export default function MarshalleseRegionScaffoldPage() {
  return (
    <>
      <PageHero
        eyebrow="Community region · scaffold"
        title="Marshallese region"
        subtitle="Architecture will mirror the Muslim Community dashboard: Overview, P5/VR, Events, Social, Youth, community-specific outreach modules, resources, messages, and rollup — with Marshallese-community-shaped content packs."
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
            Reserved for Northwest Arkansas and statewide Marshallese civic organizing partners. Same lane discipline as geographic
            teams; content and KPIs TBD with community leadership.
          </p>
          <p className="font-body text-sm text-kelly-text/75">
            Staff hub:{" "}
            <Link href="/admin/campaign-ops/community-equity" className="font-semibold text-kelly-blue underline">
              Community equity
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
