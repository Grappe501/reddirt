import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";

type QuoteBandProps = {
  quote: string;
  attribution?: string;
  variant?: "gold-band" | "subtle" | "elevated";
  className?: string;
  id?: string;
};

export function QuoteBand({
  quote,
  attribution,
  variant = "gold-band",
  className,
  id,
}: QuoteBandProps) {
  return (
    <FullBleedSection variant={variant} className={className} id={id}>
      <ContentContainer>
        <figure className="mx-auto max-w-4xl text-center">
          <blockquote className="font-heading text-2xl font-bold leading-snug text-kelly-text sm:text-3xl lg:text-[2.25rem]">
            “{quote}”
          </blockquote>
          {attribution ? (
            <figcaption className="mt-6 font-body text-sm font-semibold uppercase tracking-[0.18em] text-kelly-text/60">
              {attribution}
            </figcaption>
          ) : null}
        </figure>
      </ContentContainer>
    </FullBleedSection>
  );
}
