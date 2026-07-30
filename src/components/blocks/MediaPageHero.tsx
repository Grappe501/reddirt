import type { ReactNode } from "react";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PublicMediaSlotFrame } from "@/components/media/PublicMediaSlotFrame";
import type { PublicMediaSlotKey } from "@/lib/public-media/slot-registry";
import { cn } from "@/lib/utils";

type MediaPageHeroProps = {
  slotKey: PublicMediaSlotKey;
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  /** split = media plane + navy copy panel; bleed = media under dark scrim + copy overlay */
  layout?: "split" | "bleed";
  /** Prefer labeled empty when no owned placement (default false — show honest static stills). */
  preferLabeledEmpty?: boolean;
};

/**
 * Inner-page hero with full-bleed or split-edge media (no inset cards).
 * Brand/copy stays calm; media is proof per PUBLIC_SITE_EDITORIAL_DOCTRINE.
 */
export async function MediaPageHero({
  slotKey,
  title,
  subtitle,
  eyebrow,
  children,
  className,
  layout = "split",
  preferLabeledEmpty = false,
}: MediaPageHeroProps) {
  if (layout === "bleed") {
    return (
      <FullBleedSection variant="plain" padY={false} className={cn("relative isolate overflow-hidden", className)}>
        <div className="absolute inset-0 -z-10">
          <PublicMediaSlotFrame
            slotKey={slotKey}
            preferLabeledEmpty={preferLabeledEmpty}
            priority
            className="h-full min-h-[22rem] w-full sm:min-h-[26rem]"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-kelly-ink/88 via-kelly-navy/78 to-kelly-navy/55"
            aria-hidden
          />
        </div>
        <ContentContainer className="relative py-10 sm:py-14 lg:py-16">
          <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page" variant="onDark">
            {children}
          </HeroBlock>
        </ContentContainer>
      </FullBleedSection>
    );
  }

  return (
    <FullBleedSection variant="plain" padY={false} className={cn("border-b border-kelly-ink/10", className)}>
      <div className="grid lg:grid-cols-2 lg:min-h-[22rem]">
        <div className="relative min-h-[16rem] overflow-hidden lg:min-h-full">
          <PublicMediaSlotFrame
            slotKey={slotKey}
            preferLabeledEmpty={preferLabeledEmpty}
            priority
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center border-t border-kelly-gold/25 bg-kelly-navy lg:border-l lg:border-t-0">
          <div className="border-l-4 border-kelly-gold/90 max-sm:border-l-[3px]">
            <ContentContainer className="py-8 sm:py-10 lg:py-12">
              <HeroBlock eyebrow={eyebrow} title={title} subtitle={subtitle} size="page" variant="onDark">
                {children}
              </HeroBlock>
            </ContentContainer>
          </div>
        </div>
      </div>
    </FullBleedSection>
  );
}
