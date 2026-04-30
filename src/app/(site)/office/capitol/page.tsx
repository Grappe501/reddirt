import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Capitol & Public Safety — Secretary of State",
  description:
    "How the Arkansas Secretary of State’s office touches the State Capitol, Capitol Police, and safe operations of a public landmark—steady leadership and People over Politics.",
  path: "/office/capitol",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function CapitolAndPublicSafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="The Office"
        title="Capitol & Public Safety"
        subtitle="Part of serving as Secretary of State is stewarding an iconic public building—its grounds, its security partnership, and the everyday experience of citizens and employees who walk through its doors."
      >
        <Button href="/understand" variant="outline">
          Understand the Office
        </Button>
        <Button href="/priorities" variant="outline">
          Priorities
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY aria-labelledby="capitol-oversees">
        <ContentContainer className="max-w-3xl">
          <h2 id="capitol-oversees" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            What the office oversees
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-kelly-text/88">
            <li>Arkansas State Capitol building and grounds</li>
            <li>Capitol Police</li>
            <li>Public-facing operations of a working government facility</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="capitol-matters">
        <ContentContainer className="max-w-3xl">
          <h2 id="capitol-matters" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            Why it matters
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-kelly-text/88">
            <li>Safety for visitors, staff, and everyone who uses the people’s house</li>
            <li>Professional day-to-day management of the complex</li>
            <li>Public trust that state government is run with care and competence</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="capitol-experience">
        <ContentContainer className="max-w-3xl">
          <h2 id="capitol-experience" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            Kelly’s experience
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-kelly-text/88">
            <li>Leadership at Verizon—large organizations, clear expectations, accountable follow-through</li>
            <li>Managing large teams in high-demand environments</li>
            <li>Operating complex systems where mistakes have real consequences for real people</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="capitol-approach">
        <ContentContainer className="max-w-3xl">
          <h2 id="capitol-approach" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            Approach
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-kelly-text/88">
            <li>Clear processes people can rely on</li>
            <li>Consistency—not favoritism—from day to day</li>
            <li>Respect for law enforcement professionals and their roles</li>
            <li>Professional standards that match the dignity of the Capitol</li>
          </ul>
          <p className="mt-8 border-l-4 border-kelly-gold/60 pl-5 font-body text-base font-medium text-kelly-text/85">
            People over Politics: the building belongs to Arkansans. Administration should feel steady, welcoming, and
            serious about the work—not performative.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/10">
        <ContentContainer className="max-w-3xl text-center">
          <p className="font-body text-kelly-text/80">For more on Kelly’s background in operations and leadership:</p>
          <Button href="/about/business" variant="primary" className="mt-6">
            Experience &amp; Leadership
          </Button>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
