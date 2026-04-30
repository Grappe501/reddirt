import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { OFFICE_AREA_SLUGS, officeUnderstandTeasers } from "@/content/office/office-three-layer";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Why this race matters — The Office",
  description:
    "The Secretary of State touches elections, business filings, public records, and the Capitol complex—why the office matters, and how to learn more.",
  path: "/office/why-this-race-matters",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function WhyThisRaceMattersPage() {
  return (
    <>
      <PageHero
        eyebrow="The Office"
        title="Why this race matters"
        subtitle="This job isn’t abstract—it runs systems families and employers rely on. Here’s the high-level case, with room to go deeper on each part of the office when you’re ready."
      >
        <Button href="/about/why-kelly" variant="primary">
          Why Kelly
        </Button>
        <Button href="/understand" variant="outline">
          Understand the Office
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY aria-labelledby="race-matters-scope">
        <ContentContainer className="max-w-3xl">
          <h2 id="race-matters-scope" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            What hangs in the balance
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-kelly-text/88">
            <li>Election infrastructure that counties can run with confidence—and voters can trust.</li>
            <li>Business and nonprofit filings that either grease the wheels of commerce or grind folks down.</li>
            <li>Records and transparency tools that respect the public’s right to know.</li>
            <li>Stewardship of the Capitol and professional partnership with Capitol Police.</li>
          </ul>
          <p className="mt-8 border-l-4 border-kelly-gold/55 pl-5 font-body text-base text-kelly-text/85">
            Kelly’s pitch is straightforward administration: clear process, steady leadership, and People over Politics—so
            the office serves Arkansans, not noise.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="race-matters-explore">
        <ContentContainer className="max-w-3xl">
          <h2 id="race-matters-explore" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            Explore each office area
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-text/85">
            Start with a plain-language overview—then follow the path that fits your questions.
          </p>
          <ul className="mt-8 space-y-3 font-body text-kelly-navy">
            {OFFICE_AREA_SLUGS.map((slug) => {
              const t = officeUnderstandTeasers[slug];
              return (
                <li key={slug}>
                  <Button href={t.href} variant="ghost" className="h-auto px-0 py-2 text-base font-semibold">
                    {t.headline}
                  </Button>
                </li>
              );
            })}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
