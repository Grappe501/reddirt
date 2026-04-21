import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

export type HomeClosingSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function HomeClosingSection({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: HomeClosingSectionProps) {
  return (
    <section className="relative overflow-hidden bg-civic-midnight py-section-y lg:py-section-y-lg" aria-labelledby="closing-heading">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(201,162,39,0.12),transparent_55%)]" aria-hidden />
      <ContentContainer className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <FadeInWhenVisible>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-civic-gold">{eyebrow}</p>
            <h2 id="closing-heading" className="mt-5 font-heading text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight tracking-tight text-civic-mist">
              {title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-civic-mist/78 md:text-xl">{description}</p>
          </FadeInWhenVisible>
          <FadeInWhenVisible className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4" delay={0.12}>
            <Link
              href={primaryHref}
              target={isExternalHref(primaryHref) ? "_blank" : undefined}
              rel={isExternalHref(primaryHref) ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex min-h-[52px] items-center justify-center rounded-btn px-10 py-3.5 text-sm font-bold uppercase tracking-wider",
                "bg-civic-gold text-civic-midnight shadow-lg shadow-black/30 hover:bg-civic-gold-soft",
              )}
            >
              {primaryLabel}
              {isExternalHref(primaryHref) ? (
                <span className="sr-only"> Opens KellyGrappe.com in a new tab.</span>
              ) : null}
            </Link>
            <Link
              href={secondaryHref}
              target={isExternalHref(secondaryHref) ? "_blank" : undefined}
              rel={isExternalHref(secondaryHref) ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex min-h-[52px] items-center justify-center rounded-btn border-2 border-civic-mist/35 px-10 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-mist",
                "hover:border-civic-gold/60 hover:bg-civic-mist/5",
              )}
            >
              {secondaryLabel}
            </Link>
          </FadeInWhenVisible>
        </div>
      </ContentContainer>
    </section>
  );
}
