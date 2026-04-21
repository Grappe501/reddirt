import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { media } from "@/content/media/registry";
import type { HomepageSplitCopy } from "@/lib/content/homepage-merge";
import type { MediaRef } from "@/content/media/registry";

export type HomeSplitSectionProps = {
  variant: "democracy" | "labor";
  copy: HomepageSplitCopy;
};

const SPLIT_MEDIA: Record<HomeSplitSectionProps["variant"], MediaRef> = {
  democracy: media.splitDemocracy,
  labor: media.splitLabor,
};

export function HomeSplitSection({ variant, copy }: HomeSplitSectionProps) {
  const image = SPLIT_MEDIA[variant];
  const kicker = copy.kicker ?? (variant === "democracy" ? "Direct democracy" : "Filings & records");
  const title = copy.title ?? "";
  const body = copy.body ?? "";
  const bullets = copy.bullets ?? [];

  return (
    <section
      className="bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby={`split-${variant}-heading`}
    >
      <ContentContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeInWhenVisible className="order-2 lg:order-1">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">{kicker}</p>
            <h2
              id={`split-${variant}-heading`}
              className="mt-4 font-heading text-[clamp(1.65rem,3.2vw,2.35rem)] font-bold leading-tight tracking-tight text-civic-ink"
            >
              {title}
            </h2>
            {body ? (
              <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">{body}</p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="mt-8 space-y-3 font-body text-base leading-relaxed text-civic-slate/95">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-3 rounded-lg border border-civic-ink/8 bg-civic-fog/40 px-4 py-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-civic-gold" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </FadeInWhenVisible>
          <FadeInWhenVisible className="order-1 lg:order-2" delay={0.08}>
            <div className="relative min-h-[260px] overflow-hidden rounded-card border border-civic-ink/10 shadow-[var(--shadow-card)] lg:min-h-[380px]">
              <ContentImage media={image} warmOverlay={variant === "democracy"} className="absolute inset-0 min-h-full" />
            </div>
          </FadeInWhenVisible>
        </div>
      </ContentContainer>
    </section>
  );
}
