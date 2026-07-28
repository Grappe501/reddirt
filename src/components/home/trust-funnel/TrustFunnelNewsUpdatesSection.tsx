import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { roadPostExcerpt, type RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.newsUpdates;

function formatEventWhen(event: PublicCampaignEvent): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: event.timezone || "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(event.startAt);
  } catch {
    return event.startAt.toISOString().slice(0, 10);
  }
}

/**
 * Restrained campaign updates — only real From the Road posts / published events.
 * Never fabricates dates or placeholder stories.
 */
export function TrustFunnelNewsUpdatesSection({
  roadPreviewPosts,
  upcomingPublicEvents,
}: {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
}) {
  const posts = roadPreviewPosts.slice(0, 3);
  const events = upcomingPublicEvents.slice(0, 2);
  const hasUpdates = posts.length > 0 || events.length > 0;
  const featuredOnly = hasUpdates && posts.length + events.length === 1;

  return (
    <section
      id="campaign-updates"
      className="border-t border-kelly-ink/10 bg-kelly-wash/50 py-section-y lg:py-section-y-lg"
      aria-labelledby="campaign-updates-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{copy.eyebrow}</p>
          <h2 id="campaign-updates-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{copy.intro}</p>
        </ScrollReveal>

        {!hasUpdates ? (
          <ScrollReveal delay={40} className="mx-auto mt-10 max-w-xl text-center">
            <p className="font-body text-base text-kelly-slate">{copy.emptyState}</p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Link
                href="/from-the-road"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
              >
                {copy.fromTheRoadCta}
              </Link>
              <Link
                href="/events"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
              >
                {copy.eventsCta}
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className={`mt-10 grid gap-5 ${featuredOnly ? "mx-auto max-w-xl" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {posts.map((post, i) => {
              const href = post.canonicalUrl?.trim() || `/from-the-road#post-${post.slug}`;
              const excerpt = roadPostExcerpt(post);
              return (
                <ScrollReveal key={post.id} delay={40 + i * 30} yOffset={8}>
                  <article className="flex h-full flex-col rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
                    <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-kelly-gold">
                      From the Road
                    </p>
                    <h3 className="mt-2 font-heading text-xl font-bold text-kelly-ink">
                      <Link
                        href={href}
                        className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    {excerpt ? (
                      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">{excerpt}</p>
                    ) : null}
                  </article>
                </ScrollReveal>
              );
            })}
            {events.map((event, i) => (
              <ScrollReveal key={event.id} delay={50 + i * 30} yOffset={8}>
                <article className="flex h-full flex-col rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-kelly-gold">
                    Upcoming event
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-bold text-kelly-ink">{event.title}</h3>
                  <p className="mt-2 font-body text-sm text-kelly-slate">{formatEventWhen(event)}</p>
                  <Link
                    href={event.detailHref || "/events"}
                    className="mt-auto pt-3 inline-flex text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue"
                  >
                    Event details →
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </ContentContainer>
    </section>
  );
}
