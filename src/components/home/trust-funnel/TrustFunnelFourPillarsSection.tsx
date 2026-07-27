import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.fourPillars;

/** Equal-weight office pillars — Elections, Business, Government, Capitol. */
export function TrustFunnelFourPillarsSection() {
  return (
    <section
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="four-pillars-heading"
    >
      <ContentContainer>
        <ScrollReveal yOffset={10} className="mx-auto max-w-3xl text-center">
          <h2 id="four-pillars-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{copy.intro}</p>
        </ScrollReveal>

        <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.pillars.map((pillar, i) => (
            <ScrollReveal key={pillar.id} delay={70 + i * 60} yOffset={14}>
              <li className="flex h-full min-h-0 flex-col rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-kelly-gold/35 hover:shadow-[0_12px_36px_rgba(0,0,102,0.1)]">
                <h3 className="font-heading text-lg font-bold text-kelly-navy">
                  <Link
                    href={pillar.href}
                    className="underline-offset-4 transition hover:text-kelly-blue hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                  >
                    {pillar.title}
                  </Link>
                </h3>
                <ul className="mt-4 flex flex-1 list-none flex-col gap-2.5">
                  {pillar.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative pl-4 font-body text-sm leading-relaxed text-kelly-slate before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-kelly-gold"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </ContentContainer>
    </section>
  );
}
