import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  OFFICE_AREA_SLUGS,
  type OfficeAreaConfig,
  getOfficeArea,
  officeLayerPath,
} from "@/content/office/office-three-layer";
import type { OfficeAreaSlug } from "@/content/office/office-types";
import { OFFICE_LAYER_CTA } from "@/content/office/office-layer-labels";
import { OfficeBreadcrumbs } from "./OfficeBreadcrumbs";
import { OfficeLayerCta } from "./OfficeLayerCta";
import { OfficeLayerTrailProof } from "./OfficeLayerTrailProof";

type OfficeLayerPageProps = {
  area: OfficeAreaConfig;
  layer: 1 | 2;
};

function OfficeLayerAreaNeighbors({ currentSlug }: { currentSlug: OfficeAreaSlug }) {
  const idx = OFFICE_AREA_SLUGS.indexOf(currentSlug);
  const prevSlug = idx > 0 ? OFFICE_AREA_SLUGS[idx - 1] : undefined;
  const nextSlug = idx >= 0 && idx < OFFICE_AREA_SLUGS.length - 1 ? OFFICE_AREA_SLUGS[idx + 1] : undefined;
  const prevArea = prevSlug ? getOfficeArea(prevSlug) : undefined;
  const nextArea = nextSlug ? getOfficeArea(nextSlug) : undefined;
  if (!prevArea && !nextArea) return null;

  return (
    <FullBleedSection padY className="border-t border-kelly-text/8 bg-kelly-text/[0.02]">
      <ContentContainer className="max-w-3xl">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-text/55">More office areas</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {prevArea ? (
            <Button
              href={officeLayerPath(prevArea.slug, 1)}
              variant="outline"
              className="w-full min-h-[48px] sm:w-auto sm:min-w-[12rem]"
            >
              ← {prevArea.shortTitle}
            </Button>
          ) : (
            <span className="hidden min-h-0 sm:block sm:w-[12rem]" aria-hidden />
          )}
          {nextArea ? (
            <Button
              href={officeLayerPath(nextArea.slug, 1)}
              variant="outline"
              className="w-full min-h-[48px] sm:w-auto sm:min-w-[12rem]"
            >
              {nextArea.shortTitle} →
            </Button>
          ) : null}
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}

function LayerSections({
  area,
  copy,
  sectionKeyPrefix,
}: {
  area: OfficeAreaConfig;
  copy: OfficeAreaConfig["layerOne"];
  sectionKeyPrefix: string;
}) {
  return (
    <>
      {copy.sections.map((section, i) => (
        <FullBleedSection
          key={section.heading ?? `${sectionKeyPrefix}-${i}`}
          variant={i % 2 === 0 ? "default" : "subtle"}
          padY
          aria-labelledby={section.heading ? `office-section-${sectionKeyPrefix}-${i}` : undefined}
        >
          <ContentContainer className="max-w-3xl">
            {section.heading ? (
              <h2
                id={`office-section-${sectionKeyPrefix}-${i}`}
                className="text-pretty font-heading text-xl font-bold text-kelly-navy sm:text-2xl md:text-3xl"
              >
                {section.heading}
              </h2>
            ) : null}
            <div className={section.heading ? "mt-5 sm:mt-6" : ""}>
              {section.paragraphs.map((p, pi) => (
                <p
                  key={`${sectionKeyPrefix}-${i}-${pi}`}
                  className="font-body text-base leading-relaxed text-kelly-text/88 sm:text-[1.05rem] md:text-lg [&+&]:mt-4"
                >
                  {p}
                </p>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}

      {copy.cards?.length ? (
        <FullBleedSection variant="subtle" padY aria-labelledby={`office-cards-${sectionKeyPrefix}-${area.slug}`}>
          <ContentContainer className="max-w-5xl">
            <h2 id={`office-cards-${sectionKeyPrefix}-${area.slug}`} className="sr-only">
              Highlights
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {copy.cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-kelly-navy/10 bg-white/90 p-5 shadow-sm sm:p-6 md:p-7"
                >
                  <h3 className="font-heading text-base font-bold text-kelly-navy sm:text-lg">{card.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85 sm:text-base">{card.body}</p>
                </div>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ) : null}
    </>
  );
}

export async function OfficeLayerPage({ area, layer }: OfficeLayerPageProps) {
  const layer1Copy = area.layerOne;
  const layer1Path = officeLayerPath(area.slug, 1);

  if (layer === 1) {
    return (
      <>
        <FullBleedSection variant="subtle" padY={false} className="border-b border-kelly-text/10">
          <ContentContainer className="max-w-content pt-4 pb-2 sm:pt-5 sm:pb-3">
            <OfficeBreadcrumbs areaSlug={area.slug} areaShortTitle={area.shortTitle} layer={1} />
          </ContentContainer>
        </FullBleedSection>

        <MediaPageHero
          slotKey="office.hero"
          layout="split"
          eyebrow={layer1Copy.eyebrow}
          title={layer1Copy.title}
          subtitle={layer1Copy.intro}
        >
          <Button href="/understand" variant="outlineOnDark" className="min-h-[48px]">
            Back to The Office
          </Button>
        </MediaPageHero>

        <LayerSections area={area} copy={layer1Copy} sectionKeyPrefix={`l1-${area.slug}`} />

        <FullBleedSection padY className="border-t border-kelly-text/10">
          <ContentContainer className="max-w-3xl">
            <div className="flex flex-col items-start gap-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-text/50">Next step</p>
              <OfficeLayerCta
                href={officeLayerPath(area.slug, 2)}
                label={area.layerOneNextLabel ?? OFFICE_LAYER_CTA.layer1To2}
              />
            </div>
          </ContentContainer>
        </FullBleedSection>
      </>
    );
  }

  const layer2Copy = area.layerTwo;
  const layer3Copy = area.layerThree;

  return (
    <>
      <FullBleedSection variant="subtle" padY={false} className="border-b border-kelly-text/10">
        <ContentContainer className="max-w-content pt-4 pb-2 sm:pt-5 sm:pb-3">
          <OfficeBreadcrumbs areaSlug={area.slug} areaShortTitle={area.shortTitle} layer={2} />
        </ContentContainer>
      </FullBleedSection>

      <MediaPageHero
        slotKey="office.hero"
        layout="split"
        eyebrow={layer2Copy.eyebrow}
        title={layer2Copy.title}
        subtitle={layer2Copy.intro}
      >
        <Button href="/understand" variant="outlineOnDark" className="min-h-[48px]">
          Back to The Office
        </Button>
        <Button href={layer1Path} variant="outlineOnDark" className="min-h-[48px]">
          {`Overview · ${area.shortTitle}`}
        </Button>
      </MediaPageHero>

      <LayerSections area={area} copy={layer2Copy} sectionKeyPrefix={`l2-${area.slug}`} />

      <FullBleedSection variant="band-fog" padY aria-labelledby={`office-kelly-brings-${area.slug}`}>
        <ContentContainer className="max-w-3xl">
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-gold">What Kelly brings</p>
          <h2 id={`office-kelly-brings-${area.slug}`} className="mt-3 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {layer3Copy.title}
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/88 md:text-lg">{layer3Copy.intro}</p>
        </ContentContainer>
      </FullBleedSection>

      <LayerSections area={area} copy={layer3Copy} sectionKeyPrefix={`l3-${area.slug}`} />

      {area.layerThreeTrailProof ? (
        <OfficeLayerTrailProof
          areaSlug={area.slug}
          title={area.layerThreeTrailProof.title}
          body={area.layerThreeTrailProof.body}
          ctaLabel={area.layerThreeTrailProof.ctaLabel}
          ctaHref={area.layerThreeTrailProof.ctaHref}
        />
      ) : null}

      <FullBleedSection padY className="border-t border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          <div className="space-y-6">
            <p className="font-body text-sm font-medium uppercase tracking-wide text-kelly-text/55">Take the next step</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {layer3Copy.softCtas.map((cta) => (
                <Button
                  key={cta.label}
                  href={cta.href}
                  variant="outline"
                  className="min-h-[48px] min-w-[10.5rem] motion-reduce:transition-none"
                >
                  {cta.label}
                </Button>
              ))}
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      {area.relatedLinks?.length ? (
        <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/8">
          <ContentContainer className="max-w-3xl">
            <p className="font-body text-sm font-semibold text-kelly-text/70">Related</p>
            <ul className="mt-3 space-y-2 font-body text-kelly-navy">
              {area.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Button href={link.href} variant="ghost" className="h-auto min-h-[44px] px-0 py-1 text-base font-semibold">
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <OfficeLayerAreaNeighbors currentSlug={area.slug} />
    </>
  );
}
