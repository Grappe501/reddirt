import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { HomeFromTheRoadPreviewSection } from "@/components/home/sections/HomeFromTheRoadPreviewSection";
import { HomeUpcomingCalendarSection } from "@/components/home/sections/HomeUpcomingCalendarSection";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";

type TrustFunnelOnTheRoadProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

const motionCopy = trustFunnelHomeCopy.motion;

/**
 * Motion / activity band: prefers live calendar + From the Road posts when available.
 * TODO: optionally interleave with News or editorial rails when those feeds stabilize for homepage.
 */
export function TrustFunnelOnTheRoad({ roadPreviewPosts, upcomingPublicEvents }: TrustFunnelOnTheRoadProps) {
  const hasRoad = roadPreviewPosts.length > 0;
  const hasEvents = upcomingPublicEvents.length > 0;

  if (hasRoad || hasEvents) {
    return (
      <section className="border-t border-kelly-ink/10 bg-kelly-wash/40" aria-labelledby="on-the-road-heading">
        <ContentContainer className="pt-12 md:pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{motionCopy.kicker}</p>
            <h2 id="on-the-road-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
              {motionCopy.title}
            </h2>
            <p className="mt-4 font-body text-kelly-slate">{motionCopy.introWithFeed}</p>
          </div>
        </ContentContainer>
        {hasEvents ? <HomeUpcomingCalendarSection events={upcomingPublicEvents.slice(0, 6)} /> : null}
        {hasRoad ? <HomeFromTheRoadPreviewSection posts={roadPreviewPosts.slice(0, 6)} /> : null}
        <ContentContainer className="pb-12 md:pb-14">
          <div className="flex justify-center border-t border-kelly-ink/10 pt-10">
            <Link
              href={motionCopy.followHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-kelly-blue"
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
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{motionCopy.kicker}</p>
          <h2 id="on-the-road-placeholder-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {motionCopy.title}
          </h2>
          <p className="mt-4 font-body text-kelly-slate">{motionCopy.introPlaceholder}</p>
          {/* TODO: merge optional news feed when editorial rail is ready for homepage. */}
          <div className="mt-8 rounded-card border border-dashed border-kelly-ink/20 bg-white/60 px-6 py-10 text-center font-body text-sm text-kelly-slate">
            <p className="font-medium text-kelly-ink">{motionCopy.placeholderNoteTitle}</p>
            <p className="mt-2">{motionCopy.placeholderNoteBody}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={motionCopy.followHref}
              className="inline-flex min-h-[44px] items-center rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-kelly-blue"
            >
              {motionCopy.followCta}
            </Link>
            <Link
              href={motionCopy.placeholderSecondaryHref}
              className="inline-flex min-h-[44px] items-center rounded-btn border-2 border-kelly-ink/20 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-kelly-ink hover:border-kelly-gold"
            >
              {motionCopy.placeholderSecondaryCta}
            </Link>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
