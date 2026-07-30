import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { OfficeThreeLevelExplainer } from "@/components/office/OfficeThreeLevelExplainer";
import { OfficeUnderstandGateway } from "@/components/office/OfficeUnderstandGateway";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Understand the office",
  description:
    "What the Arkansas Secretary of State does—elections, business filings, notaries, records, and Capitol stewardship. Civic education in two levels: what the office does, then why it matters and what Kelly brings.",
  path: "/understand",
});

export default function UnderstandTheOfficePage() {
  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="The Office"
        title="Understand the Secretary of State"
        subtitle="Trust and competence come before persuasion. Learn what this office actually does, then—if you choose—why it matters to Arkansans and what Kelly brings with verified credentials."
      >
        <Button href="/office/elections" variant="primary">
          Start with elections
        </Button>
        <Button href="/about" variant="outlineOnDark">
          Meet Kelly
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <OfficeThreeLevelExplainer />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="band-fog" padY aria-labelledby="office-three-layer-gateway">
        <OfficeUnderstandGateway />
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl text-center">
          <p className="font-body text-base leading-relaxed text-kelly-text/85">
            When you leave this section, you should know what the Secretary of State does and—if you read the second
            level—why it matters and why Kelly believes she is prepared. Persuasion can wait.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/about/why-im-running" variant="outline">
              Why I&apos;m running
            </Button>
            <Button href="/priorities" variant="outline">
              Office priorities
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
