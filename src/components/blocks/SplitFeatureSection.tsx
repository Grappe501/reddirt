import { cn } from "@/lib/utils";
import { FullBleedSection, type FullBleedVariant } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";

type SplitFeatureSectionProps = {
  variant?: FullBleedVariant;
  visual: React.ReactNode;
  children: React.ReactNode;
  visualSide?: "left" | "right";
  className?: string;
  padY?: boolean;
  id?: string;
};

export function SplitFeatureSection({
  variant = "default",
  visual,
  children,
  visualSide = "left",
  className,
  padY = true,
  id,
}: SplitFeatureSectionProps) {
  const visualLeft = visualSide === "left";

  return (
    <FullBleedSection variant={variant} padY={padY} className={className} id={id}>
      <ContentContainer wide>
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div
            className={cn(
              "flex min-h-[260px] flex-col justify-center lg:min-h-[340px]",
              visualLeft ? "lg:order-1" : "lg:order-2",
            )}
          >
            {visual}
          </div>
          <div
            className={cn(
              "flex flex-col justify-center",
              visualLeft ? "lg:order-2" : "lg:order-1",
            )}
          >
            {children}
          </div>
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}
