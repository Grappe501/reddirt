import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getCampaignBlogUrl, getVolunteerSignupHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelOnTheRoad } from "@/components/home/trust-funnel/TrustFunnelOnTheRoad";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

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
              What the Office Does — And Why It Matters
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">
              The Secretary of State’s work touches elections, business filings, and public records—services Arkansans rely
              on every day.
            </p>
          </div>
          <ul className="mt-12 grid list-none gap-5 md:grid-cols-3">
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Elections</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">
                Free, fair, transparent, and accessible processes—clear information voters and counties can count on.
              </p>
            </li>
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Business Services</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">
                Filings and registrations that are legible—with fewer dead ends for employers and community groups.
              </p>
            </li>
            <li className="rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Public Records</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">
                Open, accountable access—plain language and systems that respect the public’s right to know.
              </p>
            </li>
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="/understand"
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold hover:bg-kelly-wash/50"
            >
              Understand the Office
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Competence / systems */}
      <section className="border-t border-kelly-ink/10 bg-kelly-navy py-section-y text-white lg:py-section-y-lg" aria-labelledby="competence-heading">
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="competence-heading" className="font-heading text-2xl font-bold md:text-3xl">
              Built on Experience, Not Politics
            </h2>
            <p className="mt-4 font-body text-lg text-white/85">
              Large-scale operations and people leadership translate directly to running a complex constitutional office—steady
              systems, clear expectations, and respect for the law.
            </p>
          </div>
          <ul className="mt-10 mx-auto max-w-2xl list-disc space-y-3 pl-5 font-body text-white/90 marker:text-kelly-gold">
            <li>Led large teams and operational systems in the private sector.</li>
            <li>
              Managed recruitment, training, and a management pipeline at scale—including a period overseeing 800+ people at
              Verizon.
            </li>
            <li>Ran a major high-rise call-center operation on the Arkansas River.</li>
          </ul>
          <p className="mt-8 mx-auto max-w-2xl text-center font-body text-sm text-white/75">
            Constitutional offices need administrators who understand capital operations, public-facing service, and how to
            build teams that execute—without turning public work into political theater.
          </p>
        </ContentContainer>
      </section>

      {/* Listening / community */}
      <section className="border-t border-kelly-ink/10 py-section-y lg:py-section-y-lg" aria-labelledby="listening-heading">
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="listening-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              Listening. Learning. Showing Up.
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">
              Civic organizing is part of who Kelly is—meeting people where they are, with structure and respect.
            </p>
          </div>
          <ul className="mt-10 mx-auto max-w-2xl list-disc space-y-2 pl-5 font-body text-kelly-slate marker:text-kelly-gold">
            <li>LEARNS referendum support—ground-level education and neighbor-to-neighbor outreach.</li>
            <li>Sherwood duplex petition headquarters—making ballot access work practical for volunteers.</li>
            <li>Petition pickup and dropoff—logistics that protect signatures and timelines.</li>
            <li>Notary support and issue education—removing unnecessary friction for citizens doing things the right way.</li>
            <li>Citizens showing up when given a clear structure—proof that participation grows with trust.</li>
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/from-the-road"
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy shadow-md hover:bg-kelly-gold-soft"
            >
              From the Road
            </Link>
            <Link
              href="/events"
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-ink/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-ink hover:border-kelly-gold"
            >
              See events
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Everyone has a role — four equal cards */}
      <section className="border-t border-kelly-ink/10 bg-kelly-fog/60 py-section-y lg:py-section-y-lg" aria-labelledby="roles-heading">
        <ContentContainer>
          <h2 id="roles-heading" className="text-center font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            Everyone Has a Role
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-body text-kelly-slate">
            Choose your lane—citizenship first, then the ways you want to stay connected or help.
          </p>
          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Vote / Register</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">Confirm your registration and get clear next steps.</p>
              <Link href={voterRegistrationHref} className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline">
                Go to voter center →
              </Link>
            </li>
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Volunteer</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">Help locally or online—with training and real support.</p>
              <Link
                href={volunteerHref}
                target={volunteerExt ? "_blank" : undefined}
                rel={volunteerExt ? "noopener noreferrer" : undefined}
                className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline"
              >
                Volunteer sign-up →
              </Link>
            </li>
            <li className="flex h-full flex-col rounded-card border-2 border-kelly-ink/12 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Stay Connected</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">Updates on this site plus the road journal on Substack.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href={stayHref} className="text-sm font-bold uppercase tracking-wide text-kelly-blue hover:underline">
                  Get updates →
                </Link>
                <a
                  href={blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-kelly-slate hover:text-kelly-navy hover:underline"
                >
                  Kelly’s Substack
                </a>
              </div>
            </li>
            <li className="flex h-full flex-col rounded-card border border-kelly-ink/15 bg-white/90 p-6 shadow-sm ring-1 ring-kelly-ink/5">
              <h3 className="font-heading text-lg font-bold text-kelly-navy">Donate</h3>
              <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">
                Chip in if you can—small dollars keep a statewide effort moving.
              </p>
              <Link
                href={donateHref}
                target={donateExt ? "_blank" : undefined}
                rel={donateExt ? "noopener noreferrer" : undefined}
                className="mt-4 text-sm font-bold uppercase tracking-wide text-kelly-slate hover:text-kelly-navy hover:underline"
              >
                Donate →
              </Link>
            </li>
          </ul>
        </ContentContainer>
      </section>

      {/* Trust band */}
      <section className="border-t border-kelly-gold/25 bg-kelly-navy py-10 text-white" aria-label="Campaign trust principles">
        <ContentContainer>
          <ul className="flex flex-col gap-4 text-center font-body text-sm font-semibold text-white/95 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-3">
            <li>Serving all 75 counties</li>
            <li className="hidden sm:block text-kelly-gold/50" aria-hidden>
              ·
            </li>
            <li>Transparent systems</li>
            <li className="hidden sm:block text-kelly-gold/50" aria-hidden>
              ·
            </li>
            <li>Non-partisan administration</li>
            <li className="hidden sm:block text-kelly-gold/50" aria-hidden>
              ·
            </li>
            <li>People over Politics</li>
          </ul>
        </ContentContainer>
      </section>

      <TrustFunnelOnTheRoad roadPreviewPosts={roadPreviewPosts} upcomingPublicEvents={upcomingPublicEvents} />

      {/* Final CTA */}
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/80 py-section-y lg:py-section-y-lg" aria-labelledby="final-cta-heading">
        <ContentContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="final-cta-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              Learn the story. Understand the office. Join the work.
            </h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">No pressure—just clear paths if you want to go deeper.</p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/about"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy hover:border-kelly-gold"
              >
                Meet Kelly
              </Link>
              <Link
                href={voterRegistrationHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-kelly-blue"
              >
                Vote / Register
              </Link>
              <Link
                href={volunteerHref}
                target={volunteerExt ? "_blank" : undefined}
                rel={volunteerExt ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy hover:bg-kelly-gold-soft"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </ContentContainer>
      </section>
    </div>
  );
}
