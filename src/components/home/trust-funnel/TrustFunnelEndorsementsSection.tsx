import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { trustFunnelCtaOutlineOnDark } from "@/components/home/trust-funnel/trustFunnelChrome";

const copy = trustFunnelHomeCopy.endorsements;

export type HomepageEndorsement = {
  id: string;
  organization: string;
  summary: string;
  sourceLabel?: string;
  sourceHref?: string;
};

/**
 * Endorsement band — structural shell only until confirmed records land.
 * Empty state is intentional: earned support, not unfinished filler.
 */
export function TrustFunnelEndorsementsSection({
  endorsements = [],
}: {
  endorsements?: HomepageEndorsement[];
}) {
  const confirmed = endorsements.filter((e) => e.organization.trim().length > 0);

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
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-2">
            {confirmed.map((item, i) => (
              <ScrollReveal key={item.id} delay={40 + i * 40} yOffset={6}>
                <li className="rounded-card border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="font-heading text-xl font-bold text-kelly-gold">{item.organization}</h3>
                  <p className="mt-3 font-body text-base leading-relaxed text-white/90">{item.summary}</p>
                  {item.sourceHref && item.sourceLabel ? (
                    <a
                      href={item.sourceHref}
                      className="mt-4 inline-flex font-body text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.sourceLabel}
                    </a>
                  ) : null}
                </li>
              </ScrollReveal>
            ))}
          </ul>
        ) : (
          <ScrollReveal
            delay={40}
            yOffset={6}
            className="mx-auto mt-10 max-w-2xl rounded-card border border-white/20 bg-white/[0.06] px-6 py-9 text-center md:px-10"
          >
            <p className="font-heading text-xl font-semibold leading-snug text-white md:text-2xl">
              Earned through listening, service, and trust.
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
