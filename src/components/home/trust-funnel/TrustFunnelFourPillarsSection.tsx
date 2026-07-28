import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.governmentThatWorks;

/** Government That Works — concrete office purpose with commitments (no one-sentence disclosures). */
export function TrustFunnelFourPillarsSection() {
  return (
    <section
      id="government-that-works"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="government-that-works-heading"
    >
      <ContentContainer>
        <ScrollReveal yOffset={10} className="mx-auto max-w-3xl text-center">
          <h2 id="government-that-works-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.intro}</p>
        </ScrollReveal>

        <ul className="mt-12 grid list-none gap-6 lg:grid-cols-2">
          {copy.pillars.map((pillar, i) => (
            <ScrollReveal key={pillar.id} delay={70 + i * 55} yOffset={14}>
              <li className="flex h-full min-h-0 flex-col rounded-card border border-kelly-ink/10 bg-kelly-fog/40 p-6 shadow-sm md:p-7">
                <h3 className="font-heading text-xl font-bold text-kelly-navy">
                  <Link
                    href={pillar.href}
                    className="underline-offset-4 transition hover:text-kelly-blue hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                  >
                    {pillar.title}
                  </Link>
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate">{pillar.body}</p>
                <ul className="mt-5 flex flex-1 list-none flex-col gap-2.5">
                  {pillar.commitments.map((item) => (
                    <li
                      key={item}
                      className="relative pl-4 font-body text-sm leading-relaxed text-kelly-slate before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-kelly-gold"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={pillar.href}
                  className="mt-6 inline-flex text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                >
                  Explore {pillar.title.toLowerCase()} →
                </Link>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </ContentContainer>
    </section>
  );
}
