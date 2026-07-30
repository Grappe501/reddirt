import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.executiveLeadership;

/** Soft executive differentiator — no résumé bullets or employer names. */
export function TrustFunnelExecutiveLeadershipSection() {
  return (
    <section
      className="border-t border-kelly-ink/10 bg-kelly-navy py-section-y text-white lg:py-section-y-lg"
      aria-labelledby="executive-leadership-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
            Leadership
          </p>
          <h2
            id="executive-leadership-heading"
            className="mt-4 font-heading text-2xl font-bold text-white md:text-3xl"
          >
            {copy.title}
          </h2>
          <p className="mt-6 font-heading text-xl font-semibold text-kelly-gold md:text-2xl">
            {copy.lead}
          </p>
          <p className="mt-4 font-body text-lg leading-relaxed text-white/90">{copy.body}</p>
          <p className="mt-4 font-body text-lg leading-relaxed text-white/90">{copy.closer}</p>
        </ScrollReveal>
        <ScrollReveal delay={60} className="mt-10 flex justify-center">
          <Link
            href={copy.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold-soft focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
          >
            {copy.cta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
