import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trustFunnelCtaOutlineOnDark } from "@/components/home/trust-funnel/trustFunnelChrome";
import { listHomepageEndorsements } from "@/content/website/confirmed-endorsements";

const copy = trustFunnelHomeCopy.endorsements;

/**
 * Endorsement band — concise coalition evidence on the homepage.
 * Full detail lives on /endorsements. No long testimonials here.
 */
export function TrustFunnelEndorsementsSection() {
  const confirmed = listHomepageEndorsements();

  return (
    <section
      id="endorsements"
      className="border-t border-kelly-ink/10 bg-kelly-navy py-section-y text-white lg:py-section-y-lg"
      aria-labelledby="endorsements-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center" yOffset={6}>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{copy.eyebrow}</p>
          <h2 id="endorsements-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-white/90">{copy.intro}</p>
        </ScrollReveal>

        {confirmed.length > 0 ? (
          <>
            <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {confirmed.map((item, i) => (
                <ScrollReveal key={item.id} delay={40 + i * 35} yOffset={6}>
                  <li className="flex h-full flex-col rounded-card border border-white/15 bg-white/5 p-5 text-left backdrop-blur-sm md:p-6">
                    <p className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-kelly-gold">
                      {item.coalitionLabel}
                    </p>
                    <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-white md:text-xl">
                      {item.name}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-white/80">{item.description}</p>
                    <p className="mt-auto pt-4 font-body text-xs font-semibold uppercase tracking-wide text-white/55">
                      {item.status}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
            <ScrollReveal delay={80} className="mt-10 flex justify-center" yOffset={6}>
              <Link href="/endorsements" className={trustFunnelCtaOutlineOnDark}>
                View All Endorsements
              </Link>
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal
            delay={40}
            yOffset={6}
            className="mx-auto mt-10 max-w-2xl rounded-card border border-white/20 bg-white/[0.06] px-6 py-9 text-center md:px-10"
          >
            <p className="font-heading text-xl font-semibold leading-snug text-white md:text-2xl">
              Empty on purpose until confirmed.
            </p>
            <p className="mt-4 font-body text-base leading-relaxed text-white/85">{copy.emptyState}</p>
            <Link href="/endorsements" className={`mt-7 ${trustFunnelCtaOutlineOnDark}`}>
              How we list endorsements →
            </Link>
          </ScrollReveal>
        )}
      </ContentContainer>
    </section>
  );
}
