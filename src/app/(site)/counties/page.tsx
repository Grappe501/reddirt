import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { CountyCommandHub } from "@/components/county/CountyCommandHub";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { listArkansasCountyCommandRoster } from "@/lib/county/get-county-command-data";
import { getVoterRegistrationCenterHref } from "@/lib/county/official-links";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Arkansas counties — command & organizing workbench",
  description:
    "All 75 Arkansas counties in one public workbench: region, dashboard status, organizing notes, and suggested next steps. Pope includes a full sample dashboard; other counties gain depth as packets ship.",
  path: "/counties",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default async function CountiesIndexPage() {
  const rows = await listArkansasCountyCommandRoster();

  return (
    <>
      <PageHero
        eyebrow="Arkansas field"
        title="County command & intelligence"
        subtitle="All 75 counties in one workbench: each card shows region, dashboard status, organizing status, and a suggested next action. Pope carries the gold-sample Dashboard v2 prototype; Benton and Washington are marked next build; every other county stays on command + organizing-intelligence placeholders until its packet lands—no 75 bespoke dashboards required."
      />
      <FullBleedSection className="border-b border-kelly-text/10 py-6">
        <ContentContainer>
          <p className="text-sm text-kelly-text/80">
            <Link className="font-semibold text-kelly-navy underline-offset-2 hover:underline" href={getVoterRegistrationCenterHref()}>
              Voter registration center
            </Link>{" "}
            — help, official lookup handoff, and how we count new registrations.
          </p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer wide>
          <CountyCommandHub counties={rows} mode="public" />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
