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

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

const ofc = trustFunnelHomeCopy.officeExplainer;
const comp = trustFunnelHomeCopy.competence;
const listen = trustFunnelHomeCopy.listening;
const roles = trustFunnelHomeCopy.roles;
const final = trustFunnelHomeCopy.finalCta;

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  const volunteerHref = getVolunteerSignupHref();
  const volunteerExt = isExternalHref(volunteerHref);
  const donateHref = siteConfig.donateHref;
  const donateExt = isExternalHref(donateHref);
  const stayHref = "/get-involved#join";
  const blogUrl = getCampaignBlogUrl();

  return (
    <div className="bg-white">
      <TrustFunnelHero />

      {/* Office explainer */}
      <section className="border-t border-kelly-ink/10 py-section-y lg:py-section-y-lg" aria-labelledby="office-explainer-heading">
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="office-explainer-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {ofc.title}
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{ofc.intro}</p>
          </div>
          <ul className="mt-12 grid list-none gap-5 md:grid-cols-3">
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{ofc.cards.elections.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{ofc.cards.elections.body}</p>
            </li>
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{ofc.cards.business.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{ofc.cards.business.body}</p>
            </li>
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{ofc.cards.records.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{ofc.cards.records.body}</p>
            </li>
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href={ofc.ctaHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold hover:bg-kelly-wash/50"
            >
              {ofc.cta}
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Competence / systems */}
      <section className="border-t border-kelly-ink/10 bg-kelly-navy py-section-y text-white lg:py-section-y-lg" aria-labelledby="competence-heading">
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="competence-heading" className="font-heading text-2xl font-bold md:text-3xl">
              {comp.title}
            </h2>
            <p className="mt-4 font-body text-lg text-white/85">{comp.intro}</p>
          </div>
          <ul className="mt-10 mx-auto max-w-2xl list-disc space-y-3 pl-5 font-body text-white/90 marker:text-kelly-gold">
            {comp.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-8 mx-auto max-w-2xl text-center font-body text-sm text-white/75">{comp.bridge}</p>
          <div className="mt-10 flex justify-center">
            <Link
              href={comp.ctaHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy shadow-md transition hover:bg-kelly-gold-soft"
            >
              {comp.cta}
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Listening / community */}
      <section className="border-t border-kelly-ink/10 py-section-y lg:py-section-y-lg" aria-labelledby="listening-heading">
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="listening-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {listen.title}
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{listen.intro}</p>
          </div>
          <ul className="mt-10 mx-auto max-w-2xl list-disc space-y-2 pl-5 font-body text-kelly-slate marker:text-kelly-gold">
            {listen.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={listen.primaryHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy shadow-md hover:bg-kelly-gold-soft"
            >
              {listen.primaryCta}
            </Link>
            <Link
              href={listen.secondaryHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-ink/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-ink hover:border-kelly-gold"
            >
              {listen.secondaryCta}
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Everyone has a role — four equal cards */}
      <section className="border-t border-kelly-ink/10 bg-kelly-fog/60 py-section-y lg:py-section-y-lg" aria-labelledby="roles-heading">
        <ContentContainer>
          <h2 id="roles-heading" className="text-center font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {roles.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-body text-kelly-slate">{roles.intro}</p>
          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.vote.title}</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.vote.body}</p>
              <Link href={voterRegistrationHref} className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline">
                {roles.cards.vote.linkLabel} →
              </Link>
            </li>
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.volunteer.title}</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.volunteer.body}</p>
              <Link
                href={volunteerHref}
                target={volunteerExt ? "_blank" : undefined}
                rel={volunteerExt ? "noopener noreferrer" : undefined}
                className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline"
              >
                {roles.cards.volunteer.linkLabel} →
              </Link>
            </li>
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.stayConnected.title}</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.stayConnected.body}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href={stayHref} className="text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline">
                  {roles.cards.stayConnected.linkLabelUpdates} →
                </Link>
                <a
                  href={blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-kelly-slate hover:text-kelly-navy hover:underline"
                >
                  {roles.cards.stayConnected.linkLabelBlog}
                </a>
              </div>
            </li>
            <li className="flex h-full flex-col rounded-card border border-kelly-ink/15 bg-white/90 p-6 shadow-sm ring-1 ring-kelly-ink/5">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.donate.title}</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.donate.body}</p>
              <Link
                href={donateHref}
                target={donateExt ? "_blank" : undefined}
                rel={donateExt ? "noopener noreferrer" : undefined}
                className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-slate hover:text-kelly-navy hover:underline"
              >
                {roles.cards.donate.linkLabel} →
              </Link>
            </li>
          </ul>
        </ContentContainer>
      </section>

      {/* Trust band */}
      <section className="border-t border-kelly-gold/25 bg-kelly-navy py-10 text-white" aria-label="Campaign trust principles">
        <ContentContainer>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center font-body text-sm font-semibold text-white/95">
            {trustFunnelHomeCopy.trustBand.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </ContentContainer>
      </section>

      <TrustFunnelOnTheRoad roadPreviewPosts={roadPreviewPosts} upcomingPublicEvents={upcomingPublicEvents} />

      {/* Final CTA */}
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/80 py-section-y lg:py-section-y-lg" aria-labelledby="final-cta-heading">
        <ContentContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="final-cta-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {final.title}
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{final.body}</p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/about"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy hover:border-kelly-gold"
              >
                {final.ctas.meetKelly}
              </Link>
              <Link
                href={voterRegistrationHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-kelly-blue"
              >
                {final.ctas.voteRegister}
              </Link>
              <Link
                href={volunteerHref}
                target={volunteerExt ? "_blank" : undefined}
                rel={volunteerExt ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy hover:bg-kelly-gold-soft"
              >
                {final.ctas.volunteer}
              </Link>
            </div>
          </div>
        </ContentContainer>
      </section>
    </div>
  );
}
