import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { OfficeThreeLevelExplainer } from "@/components/office/OfficeThreeLevelExplainer";
import { OfficeUnderstandGateway } from "@/components/office/OfficeUnderstandGateway";
import { officeExplainerCopy } from "@/content/office/office-explainer";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "What the office does",
  description:
    "What the Arkansas Secretary of State does: elections, business filings, notaries, initiatives, public records, and the State Capitol—plain-language duties from official sources.",
  path: "/understand",
});

const c = officeExplainerCopy;

export default function UnderstandTheOfficePage() {
  return (
    <>
      <PageHero tone="plan" eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button href="/priorities" variant="primary">
          See My Plan
        </Button>
        <Button href="/about" variant="outlineOnDark">
          Meet Kelly
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          <ul className="grid list-none gap-5 md:grid-cols-2">
            {c.functions.map((fn) => (
              <li key={fn.title} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-kelly-navy">{fn.title}</h2>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate">{fn.body}</p>
                <p className="mt-4">
                  <Link
                    href={fn.href}
                    className="font-body text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue"
                  >
                    Learn more →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-3xl text-center font-body text-lg leading-relaxed text-kelly-slate">
            {c.closer}
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <OfficeThreeLevelExplainer />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="band-fog" padY aria-labelledby="office-three-layer-gateway">
        <OfficeUnderstandGateway />
      </FullBleedSection>
    </>
  );
}
