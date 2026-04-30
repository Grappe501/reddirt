import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { HomeFromTheRoadPreviewSection } from "@/components/home/sections/HomeFromTheRoadPreviewSection";
import { HomeUpcomingCalendarSection } from "@/components/home/sections/HomeUpcomingCalendarSection";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type TrustFunnelOnTheRoadProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

const motionCopy = trustFunnelHomeCopy.motion;

/**
 * Motion / activity band: prefers live calendar + From the Road posts when available.
 * TODO: optionally interleave with News or editorial rails when those feeds stabilize for homepage.
 * TODO(ux): optional prev/next controls that scroll `.trust-funnel-road-rail` containers (see data attribute).
 */
export function TrustFunnelOnTheRoad({ roadPreviewPosts, upcomingPublicEvents }: TrustFunnelOnTheRoadProps) {
  const hasRoad = roadPreviewPosts.length > 0;
  const hasEvents = upcomingPublicEvents.length > 0;

  if (hasRoad || hasEvents) {
    return (
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/40" aria-labelledby="on-the-road-heading">
        <ContentContainer className="pt-12 md:pt-14">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{motionCopy.kicker}</p>
            <h2 id="on-the-road-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {motionCopy.title}
            </h2>
            <p className="mt-4 font-body text-kelly-slate">{motionCopy.introWithFeed}</p>
          </ScrollReveal>
        </ContentContainer>
        <div data-trust-funnel-road-rail>
          {hasEvents ? (
            <HomeUpcomingCalendarSection events={upcomingPublicEvents.slice(0, 6)} layoutRail />
          ) : null}
        </div>
        <div data-trust-funnel-road-rail>
          {hasRoad ? (
            <HomeFromTheRoadPreviewSection
              posts={roadPreviewPosts.slice(0, 6)}
              omitSectionLead
              layoutRail
            />
          ) : null}
        </div>
        {(hasRoad && roadPreviewPosts.length > 1) || (hasEvents && upcomingPublicEvents.length > 1) ? (
          <p className="-mt-2 pb-4 text-center font-body text-xs text-kelly-slate/80 md:hidden">
            Swipe sideways to see more updates.
          </p>
        ) : null}
        <ContentContainer className="pb-12 md:pb-14">
          <div className="flex justify-center border-t border-kelly-ink/10 pt-10">
            <Link
              href={motionCopy.followHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-kelly-blue hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
            >
              {motionCopy.followCta}
            </Link>
          </div>
        </ContentContainer>
      </section>
    );
  }

  return (
    <section className="border-t border-kelly-ink/10 bg-kelly-fog/80 py-section-y" aria-labelledby="on-the-road-placeholder-heading">
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{motionCopy.kicker}</p>
          <h2 id="on-the-road-placeholder-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {motionCopy.title}
          </h2>
          <p className="mt-4 font-body text-kelly-slate">{motionCopy.introPlaceholder}</p>
        </ScrollReveal>
        {/* TODO: replace placeholder rail with live cards when `listRoadPreviewPosts` / public calendar return rows. */}
        <div className="mt-8 -mx-[var(--gutter-x)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter-x)] pb-2 [scrollbar-width:thin] md:mx-0 md:justify-center md:overflow-visible md:px-0">
          {[0, 1, 2].map((i) => (
            <ScrollReveal key={i} delay={80 + i * 60} yOffset={12} className="w-[min(88vw,17rem)] shrink-0 snap-center md:w-[14rem]">
              <div className="flex h-full min-h-[10rem] flex-col rounded-card border border-dashed border-kelly-ink/20 bg-white/70 p-5 text-left shadow-sm">
                <p className="font-heading text-sm font-bold text-kelly-navy">Trail updates</p>
                <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-kelly-slate">
                  Public events and field posts will appear here—nothing fabricated. Check back as the campaign publishes
                  stops.
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <p className="mt-2 text-center font-body text-xs text-kelly-slate/80 md:hidden">Swipe sideways to browse placeholders.</p>
        <div className="mt-8 rounded-card border border-dashed border-kelly-ink/20 bg-white/60 px-6 py-8 text-center font-body text-sm text-kelly-slate">
          <p className="font-medium text-kelly-ink">{motionCopy.placeholderNoteTitle}</p>
          <p className="mt-2">{motionCopy.placeholderNoteBody}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={motionCopy.followHref}
            className="inline-flex min-h-[44px] items-center rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-kelly-blue hover:shadow-md"
          >
            {motionCopy.followCta}
          </Link>
          <Link
            href={motionCopy.placeholderSecondaryHref}
            className="inline-flex min-h-[44px] items-center rounded-btn border-2 border-kelly-ink/20 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-kelly-ink transition duration-300 ease-out hover:-translate-y-0.5 hover:border-kelly-gold hover:shadow-sm"
          >
            {motionCopy.placeholderSecondaryCta}
          </Link>
        </div>
      </ContentContainer>
    </section>
  );
}
