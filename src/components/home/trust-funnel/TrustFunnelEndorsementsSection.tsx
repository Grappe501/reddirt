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
 * Do not invent logos, quotes, or labor-endorsement wording without campaign-record confirmation.
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
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{copy.eyebrow}</p>
          <h2 id="endorsements-heading" className="mt-3 font-heading text-2xl font-bold md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-white/90">{copy.intro}</p>
        </ScrollReveal>

        {confirmed.length > 0 ? (
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-2">
            {confirmed.map((item, i) => (
              <ScrollReveal key={item.id} delay={40 + i * 40} yOffset={10}>
                <li className="rounded-card border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="font-heading text-xl font-bold text-kelly-gold">{item.organization}</h3>
                  <p className="mt-3 font-body text-base leading-relaxed text-white/90">{item.summary}</p>
                  {item.sourceHref && item.sourceLabel ? (
                    <a
                      href={item.sourceHref}
                      className="mt-4 inline-flex font-body text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
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
          <ScrollReveal delay={40} yOffset={6} className="mx-auto mt-10 max-w-2xl rounded-card border border-dashed border-white/25 bg-white/5 px-6 py-8 text-center">
            <p className="font-body text-base leading-relaxed text-white/85">{copy.emptyState}</p>
            <Link href="/endorsements" className={`mt-6 ${trustFunnelCtaOutlineOnDark}`}>
              Endorsement policy →
            </Link>
          </ScrollReveal>
        )}
      </ContentContainer>
    </section>
  );
}
