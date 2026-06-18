import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getCampaignBlogUrl, getVolunteerSignupHref } from "@/config/external-campaign";
import { siteConfig } from "@/config/site";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { TrustFunnelDirectDemocracySection } from "@/components/home/trust-funnel/TrustFunnelDirectDemocracySection";
import { directDemocracyHubHref } from "@/config/direct-democracy-links";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelMeetKellySection } from "@/components/home/trust-funnel/TrustFunnelMeetKellySection";
import { TrustFunnelOfficeExplainerSection } from "@/components/home/trust-funnel/TrustFunnelOfficeExplainerSection";
import { TrustFunnelInviteKellySection } from "@/components/home/trust-funnel/TrustFunnelInviteKellySection";
import { TrustFunnelListeningSection } from "@/components/home/trust-funnel/TrustFunnelListeningSection";
import { TrustFunnelRolesSection } from "@/components/home/trust-funnel/TrustFunnelRolesSection";
import { TrustFunnelOnTheRoad } from "@/components/home/trust-funnel/TrustFunnelOnTheRoad";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

const meetBand = trustFunnelHomeCopy.meetKellyBand;
const final = trustFunnelHomeCopy.finalCta;

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  const volunteerHref = getVolunteerSignupHref();

  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelOfficeExplainerSection />

      <TrustFunnelDirectDemocracySection />

      <TrustFunnelMeetKellySection />

      {/* Experience band — links to Meet Kelly; no unsourced résumé bullets on homepage */}
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/60 py-section-y lg:py-section-y-lg" aria-labelledby="experience-heading">
        <ContentContainer>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 id="experience-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {meetBand.title}
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{meetBand.intro}</p>
          </ScrollReveal>
          <ScrollReveal delay={60} className="mt-8 flex justify-center">
            <Link
              href={meetBand.ctaHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold/50"
            >
              {meetBand.cta}
            </Link>
          </ScrollReveal>
        </ContentContainer>
      </section>

      <TrustFunnelInviteKellySection />

      <section id="get-involved">
        <TrustFunnelRolesSection
          volunteerHref={volunteerHref}
          donateHref={siteConfig.donateHref}
          stayHref="/get-involved#join"
          blogUrl={getCampaignBlogUrl()}
        />
      </section>

      <TrustFunnelListeningSection />

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

      <TrustFunnelOnTheRoad roadPreviewPosts={roadPreviewPosts} upcomingPublicEvents={upcomingPublicEvents} />

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
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold hover:shadow-md"
              >
                {final.ctas.meetKelly}
              </Link>
              <Link
                href={directDemocracyHubHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-gold/50 bg-kelly-gold/15 px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold/25"
              >
                {final.ctas.directDemocracy}
              </Link>
              <Link
                href="/events/request"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-kelly-blue"
              >
                {final.ctas.inviteKelly}
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold-soft"
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
