import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { SectionHeading } from "@/components/blocks/SectionHeading";

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: "primary-band" | "soil" | "denim";
  className?: string;
  id?: string;
};

export function CTASection({
  eyebrow,
  title,
  description,
  children,
  variant = "primary-band",
  className,
  id,
}: CTASectionProps) {
  return (
    <FullBleedSection variant={variant} id={id} className={className}>
      <ContentContainer className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={description}
          align="left"
          className="max-w-2xl text-cream-canvas [&_h2]:text-cream-canvas [&_p.mb-3]:text-sunlight-gold [&_p]:text-cream-canvas/85"
        />
        <div className="flex flex-shrink-0 flex-wrap gap-4">{children}</div>
      </ContentContainer>
    </FullBleedSection>
  );
}
