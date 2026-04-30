import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getCampaignBlogUrl, getVolunteerSignupHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelOnTheRoad } from "@/components/home/trust-funnel/TrustFunnelOnTheRoad";
import { TrustFunnelOfficeExplainerSection } from "@/components/home/trust-funnel/TrustFunnelOfficeExplainerSection";
import { TrustFunnelListeningSection } from "@/components/home/trust-funnel/TrustFunnelListeningSection";
import { TrustFunnelRolesSection } from "@/components/home/trust-funnel/TrustFunnelRolesSection";
import { HomeSystemsFlow } from "@/components/home/HomeSystemsFlow";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

const comp = trustFunnelHomeCopy.competence;
const final = trustFunnelHomeCopy.finalCta;

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  const volunteerHref = getVolunteerSignupHref();
  const volunteerExt = isExternalHref(volunteerHref);

  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelOfficeExplainerSection />

      {/* Competence / systems */}
      <section className="border-t border-kelly-ink/10 bg-kelly-navy py-section-y text-white lg:py-section-y-lg" aria-labelledby="competence-heading">
        <ContentContainer>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 id="competence-heading" className="font-heading text-2xl font-bold md:text-3xl">
              {comp.title}
            </h2>
            <p className="mt-4 font-body text-lg text-white/85">{comp.intro}</p>
          </ScrollReveal>
          <ScrollReveal delay={60} className="mt-10">
            <ul className="mx-auto max-w-2xl list-disc space-y-3 pl-5 font-body text-white/90 marker:text-kelly-gold">
              {comp.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="mt-8 mx-auto max-w-2xl text-center font-body text-sm text-white/75">{comp.bridge}</p>
          </ScrollReveal>
          <HomeSystemsFlow />
          <ScrollReveal delay={80} className="mt-10 flex justify-center">
            <Link
              href={comp.ctaHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-kelly-gold-soft hover:shadow-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/60"
            >
              {comp.cta}
            </Link>
          </ScrollReveal>
        </ContentContainer>
      </section>

      <TrustFunnelListeningSection />

      <TrustFunnelRolesSection
        volunteerHref={volunteerHref}
        donateHref={siteConfig.donateHref}
        stayHref="/get-involved#join"
        blogUrl={getCampaignBlogUrl()}
      />

      {/* Trust band */}
      <section className="border-t border-kelly-gold/25 bg-kelly-navy py-10 text-white" aria-label="Campaign trust principles">
        <ContentContainer>
          <ScrollReveal yOffset={6}>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center font-body text-sm font-semibold text-white/95">
              {trustFunnelHomeCopy.trustBand.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </ScrollReveal>
        </ContentContainer>
      </section>

      <TrustFunnelOnTheRoad
        roadPreviewPosts={roadPreviewPosts}
        upcomingPublicEvents={upcomingPublicEvents}
      />

      {/* Final CTA */}
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/80 py-section-y lg:py-section-y-lg" aria-labelledby="final-cta-heading">
        <ContentContainer>
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 id="final-cta-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {final.title}
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{final.body}</p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/about"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-kelly-gold hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/40"
              >
                {final.ctas.meetKelly}
              </Link>
              <Link
                href={voterRegistrationHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-kelly-blue hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/30"
              >
                {final.ctas.voteRegister}
              </Link>
              <Link
                href={volunteerHref}
                target={volunteerExt ? "_blank" : undefined}
                rel={volunteerExt ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-kelly-gold-soft hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-navy/25"
              >
                {final.ctas.volunteer}
              </Link>
            </div>
          </ScrollReveal>
        </ContentContainer>
      </section>
    </div>
  );
}
