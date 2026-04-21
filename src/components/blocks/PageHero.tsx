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
  children?: ReactNode;
  /** Aligns with “The Plan” section: civic blue, gold edge — same world as the new header. */
  tone?: "default" | "plan";
};

export function PageHero({ title, subtitle, eyebrow, className, children, tone = "default" }: PageHeroProps) {
  if (tone === "plan") {
    return (
      <FullBleedSection variant="civic-blue" padY className={cn("border-b border-civic-gold/25", className)}>
        <div className="border-l-4 border-sunlight-gold/90">
          <ContentContainer className="py-10 lg:py-14">
            <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page" variant="onDark">
              {children}
            </HeroBlock>
          </ContentContainer>
        </div>
      </FullBleedSection>
    );
  }
  return (
    <FullBleedSection variant="subtle" padY className={cn("border-b border-deep-soil/10", className)}>
      <ContentContainer className="py-10 lg:py-14">
        <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page">
          {children}
        </HeroBlock>
      </ContentContainer>
    </FullBleedSection>
  );
}
