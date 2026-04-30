import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  type OfficeAreaConfig,
  officeLayerPath,
} from "@/content/office/office-three-layer";
import { OfficeBreadcrumbs } from "./OfficeBreadcrumbs";
import { OfficeLayerCta } from "./OfficeLayerCta";

type OfficeLayerPageProps = {
  area: OfficeAreaConfig;
  layer: 1 | 2 | 3;
};

export function OfficeLayerPage({ area, layer }: OfficeLayerPageProps) {
  const copy = layer === 1 ? area.layerOne : layer === 2 ? area.layerTwo : area.layerThree;
  const layer1Path = officeLayerPath(area.slug, 1);

  return (
    <>
      <FullBleedSection variant="subtle" padY={false} className="border-b border-kelly-text/10">
        <ContentContainer className="max-w-content pt-4 pb-2 sm:pt-5 sm:pb-3">
          <OfficeBreadcrumbs areaSlug={area.slug} areaShortTitle={area.shortTitle} layer={layer} />
        </ContentContainer>
      </FullBleedSection>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.intro}>
        <Button href="/understand" variant="outline">
          Back to The Office
        </Button>
        {layer > 1 ? (
          <Button href={layer1Path} variant="outline">
            {`Overview · ${area.shortTitle}`}
          </Button>
        ) : null}
      </PageHero>

      {copy.sections.map((section, i) => (
        <FullBleedSection
          key={section.heading ?? `section-${i}`}
          variant={i % 2 === 0 ? "default" : "subtle"}
          padY
          aria-labelledby={section.heading ? `office-section-${area.slug}-${i}` : undefined}
        >
          <ContentContainer className="max-w-3xl">
            {section.heading ? (
              <h2
                id={`office-section-${area.slug}-${i}`}
                className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl"
              >
                {section.heading}
              </h2>
            ) : null}
            <div className={section.heading ? "mt-6" : ""}>
              {section.paragraphs.map((p, pi) => (
                <p key={`${i}-${pi}`} className="font-body text-lg leading-relaxed text-kelly-text/88 [&+&]:mt-4">
                  {p}
                </p>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}

      {copy.cards?.length ? (
        <FullBleedSection variant="subtle" padY aria-labelledby={`office-cards-${area.slug}`}>
          <ContentContainer className="max-w-5xl">
            <h2 id={`office-cards-${area.slug}`} className="sr-only">
              Highlights
            </h2>
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              {copy.cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-kelly-navy/10 bg-white/90 p-6 shadow-sm md:p-7"
                >
                  <h3 className="font-heading text-lg font-bold text-kelly-navy">{card.title}</h3>
                  <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/85">{card.body}</p>
                </div>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection padY className="border-t border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          {layer === 1 ? (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <OfficeLayerCta href={officeLayerPath(area.slug, 2)} label="See why this matters" />
            </div>
          ) : null}
          {layer === 2 ? (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <OfficeLayerCta href={officeLayerPath(area.slug, 3)} label="See the full picture" />
            </div>
          ) : null}
          {layer === 3 ? (
            <div className="space-y-6">
              <p className="font-body text-sm font-medium uppercase tracking-wide text-kelly-text/55">Take the next step</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {area.layerThree.softCtas.map((cta) => (
                  <Button key={cta.label} href={cta.href} variant="outline" className="min-w-[10.5rem]">
                    {cta.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      {layer === 3 && area.relatedLinks?.length ? (
        <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/8">
          <ContentContainer className="max-w-3xl">
            <p className="font-body text-sm font-semibold text-kelly-text/70">Related</p>
            <ul className="mt-3 space-y-2 font-body text-kelly-navy">
              {area.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Button href={link.href} variant="ghost" className="h-auto px-0 py-1 text-base font-semibold">
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </ContentContainer>
        </FullBleedSection>
      ) : null}
    </>
  );
}
