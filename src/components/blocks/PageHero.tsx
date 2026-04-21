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
};

export function PageHero({ title, subtitle, eyebrow, className, children }: PageHeroProps) {
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
