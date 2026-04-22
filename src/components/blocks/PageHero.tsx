import type { ReactNode } from "react";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  className?: string;
  /** Merged with default hero vertical padding (e.g. tighten bottom on a per-page basis). */
  contentClassName?: string;
  children?: ReactNode;
  /** Aligns with “The Plan” section: civic blue, gold edge — same world as the new header. */
  tone?: "default" | "plan";
};

export function PageHero({
  title,
  subtitle,
  eyebrow,
  className,
  contentClassName,
  children,
  tone = "default",
}: PageHeroProps) {
  if (tone === "plan") {
    return (
      <FullBleedSection variant="civic-blue" padY={false} className={cn("border-b border-civic-gold/25", className)}>
        <div className="border-l-4 border-sunlight-gold/90">
          <ContentContainer
            className={cn("pt-5 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14", contentClassName)}
          >
            <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page" variant="onDark">
              {children}
            </HeroBlock>
          </ContentContainer>
        </div>
      </FullBleedSection>
    );
  }
  return (
    <FullBleedSection variant="subtle" padY={false} className={cn("border-b border-deep-soil/10", className)}>
      <ContentContainer
        className={cn("pt-5 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14", contentClassName)}
      >
        <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page">
          {children}
        </HeroBlock>
      </ContentContainer>
    </FullBleedSection>
  );
}
