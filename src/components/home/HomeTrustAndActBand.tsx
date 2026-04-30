import Link from "next/link";
import { CTASection } from "@/components/blocks/CTASection";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { TRUST_RIBBON_ITEMS } from "@/content/home/homepagePremium";
import type { MergedHomepageConfig } from "@/lib/content/homepage-merge";
import { isExternalHref } from "@/lib/href";

type Props = {
  finalCta: MergedHomepageConfig["finalCta"];
};

/** Trust ribbon + dual CTA before the “Get involved” grid. */
export function HomeTrustAndActBand({ finalCta }: Props) {
  return (
    <>
      <FullBleedSection variant="ink-band" id="trust-privacy-home" aria-labelledby="trust-privacy-heading">
        <ContentContainer className="py-section-y lg:py-section-y-lg">
          <header className="mx-auto max-w-3xl text-center text-kelly-page">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Trust &amp; privacy</p>
            <h2 id="trust-privacy-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-page">
              No surprises with your data—or your time
            </h2>
            <p className="mt-5 font-body text-lg leading-relaxed text-kelly-mist/90 md:text-xl">
              Clear labels, plain-language policies, and approachable explanations—so you always know what you&apos;re looking at.
            </p>
          </header>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_RIBBON_ITEMS.map((item, i) => (
              <FadeInWhenVisible key={item.label} delay={0.05 * i}>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{item.label}</p>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-mist/90">{item.detail}</p>
              </FadeInWhenVisible>
            ))}
          </div>
          <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-kelly-page/20 pt-8 text-center font-body text-sm font-semibold text-kelly-gold">
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:underline">
              Terms of use
            </Link>
            <Link href="/disclaimer" className="underline-offset-4 hover:underline">
              Disclaimer
            </Link>
          </nav>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        id="home-trust-final-cta"
        eyebrow={finalCta.eyebrow}
        title={finalCta.title}
        description={finalCta.description}
        variant="primary-band"
      >
        <Link
          href={finalCta.primaryHref}
          target={isExternalHref(finalCta.primaryHref) ? "_blank" : undefined}
          rel={isExternalHref(finalCta.primaryHref) ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-kelly-navy shadow-lg transition hover:bg-kelly-gold-soft"
        >
          {finalCta.primaryLabel}
        </Link>
        <Link
          href={finalCta.secondaryHref}
          target={isExternalHref(finalCta.secondaryHref) ? "_blank" : undefined}
          rel={isExternalHref(finalCta.secondaryHref) ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/55 bg-transparent px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-kelly-gold hover:bg-white/10"
        >
          {finalCta.secondaryLabel}
        </Link>
      </CTASection>
    </>
  );
}
