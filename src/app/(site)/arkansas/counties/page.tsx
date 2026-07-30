import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { ArkansasCountySearchList } from "@/components/arkansas/ArkansasCountySearchList";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";
import { loadPublicCountyPresence } from "@/lib/county/public-county-presence";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const listCopy = arkansasPresenceCopy.countiesPage;

export const metadata: Metadata = pageMeta({
  title: "Arkansas counties — visit status",
  description:
    "Search all 75 Arkansas counties: verified visits from published campaign events and upcoming public stop counts. No workbench, no campaign intelligence.",
  path: "/arkansas/counties",
  imageSrc: "/media/placeholders/hero-arkansas-warm.svg",
});

export default async function ArkansasCountiesPage() {
  const presence = await loadPublicCountyPresence();

  return (
    <>
      <PageHero eyebrow="Arkansas counties" title={listCopy.title} subtitle={listCopy.subtitle}>
        <Button href="/arkansas" variant="outline">
          County presence map
        </Button>
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer wide className="max-w-4xl">
          <ArkansasCountySearchList counties={presence.counties} />
          <p className="mt-10 font-body text-sm text-kelly-muted">
            County detail pages are omitted until visit data quality supports them.{" "}
            <Link href="/schedule" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Request an event
            </Link>{" "}
            in any county.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
