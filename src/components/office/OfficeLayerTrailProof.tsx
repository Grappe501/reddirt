import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import type { OfficeAreaSlug } from "@/content/office/office-types";

type OfficeLayerTrailProofProps = {
  areaSlug: OfficeAreaSlug;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export function OfficeLayerTrailProof({ areaSlug, title, body, ctaLabel, ctaHref }: OfficeLayerTrailProofProps) {
  const headingId = `office-trail-proof-${areaSlug}`;
  return (
    <FullBleedSection variant="subtle" padY aria-labelledby={headingId}>
      <ContentContainer className="max-w-3xl">
        <h2 id={headingId} className="text-pretty font-heading text-xl font-bold text-kelly-navy sm:text-2xl md:text-3xl">
          {title}
        </h2>
        <p className="mt-5 font-body text-base leading-relaxed text-kelly-text/88 sm:text-[1.05rem] md:text-lg">{body}</p>
        <div className="mt-6">
          <Button href={ctaHref} variant="outline" className="min-h-[48px] motion-reduce:transition-none">
            {ctaLabel}
          </Button>
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}
