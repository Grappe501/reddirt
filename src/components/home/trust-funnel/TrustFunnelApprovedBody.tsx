import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { HomeCampaignTrailMapTeaser } from "@/components/home/trust-funnel/HomeCampaignTrailMapTeaser";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trustFunnelCardMutedClass } from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.approvedHome;

/**
 * Approved homepage substance (Kelly Grappe Website Master Direction).
 * Photography, cards, and spacing stay in the existing trust-funnel chrome.
 */
export async function TrustFunnelApprovedBody() {
  return (
    <>
      <section
        id="restore-trust"
        className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
        aria-labelledby="restore-trust-heading"
      >
        <ContentContainer className="max-w-3xl">
          <ScrollReveal yOffset={6}>
            <h2
              id="restore-trust-heading"
              className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl"
            >
              {copy.restoreTrust.title}
            </h2>
            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              {copy.restoreTrust.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </ContentContainer>
      </section>

      <section
        id="office-responsibility"
        className="border-t border-kelly-ink/10 bg-kelly-wash/40 py-section-y lg:py-section-y-lg"
        aria-labelledby="office-responsibility-heading"
      >
        <ContentContainer className="max-w-3xl">
          <ScrollReveal yOffset={6}>
            <h2
              id="office-responsibility-heading"
              className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl"
            >
              {copy.officeResponsibility.title}
            </h2>
            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              {copy.officeResponsibility.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </ContentContainer>
      </section>

      <section
        id="my-plan"
        className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
        aria-labelledby="my-plan-heading"
      >
        <ContentContainer>
          <ScrollReveal yOffset={6} className="mx-auto max-w-2xl text-center">
            <h2
              id="my-plan-heading"
              className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl"
            >
              {copy.planCards.title}
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              {copy.planCards.intro}
            </p>
          </ScrollReveal>

          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.planCards.cards.map((card, i) => (
              <ScrollReveal key={card.id} delay={40 + i * 30} yOffset={6}>
                <li className={cn(trustFunnelCardMutedClass, "flex h-full min-h-0 flex-col p-5 md:p-6")}>
                  <h3 className="font-heading text-lg font-bold text-kelly-navy md:text-xl">{card.title}</h3>
                  <Link
                    href={card.href}
                    className="mt-4 inline-flex min-h-[48px] items-center text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                  >
                    See this part of My Plan →
                  </Link>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </ContentContainer>
      </section>

      <section
        id="arkansas-runs-arkansas-elections"
        className="border-t border-kelly-ink/10 bg-kelly-wash/40 py-section-y lg:py-section-y-lg"
        aria-labelledby="arkansas-elections-heading"
      >
        <ContentContainer className="max-w-3xl">
          <HomeCampaignTrailMapTeaser />
          <ScrollReveal yOffset={6}>
            <h2
              id="arkansas-elections-heading"
              className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl"
            >
              {copy.arkansasElections.title}
            </h2>
            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              {copy.arkansasElections.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </ContentContainer>
      </section>
    </>
  );
}
