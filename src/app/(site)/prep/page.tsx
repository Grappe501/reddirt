import type { Metadata } from "next";

import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { DrinkSignPrep } from "@/components/prep/DrinkSignPrep";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Event prep",
  description: "Printable drink table tents with a donate QR on every sign, plus a JPG download under each one.",
  path: "/prep",
});

export default function PrepPage() {
  return (
    <>
      <PageHero
        eyebrow="Tonight · table signs"
        title="Event prep"
        subtitle="Four fold-in-half drink tents on one letter page, plus a full-page bottled water sign. Every sign has a donate QR and a Download JPG button at the bottom."
      />
      <FullBleedSection padY>
        <ContentContainer>
          <DrinkSignPrep />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
