import type { Metadata } from "next";
import { ContentPlatform } from "@prisma/client";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentHubActionBand } from "@/components/content/ContentHubActionBand";
import { ContentLocality } from "@/components/content/ContentLocality";
import { FromTheRoadLiveEmbeds } from "@/components/from-the-road/FromTheRoadLiveEmbeds";
import { FromTheRoadSocialHub } from "@/components/from-the-road/FromTheRoadSocialHub";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { OnTheRoadProofSections } from "@/components/road/OnTheRoadProofSections";
import { getFromTheRoadEmbedsConfig, fromTheRoadHasLiveEmbeds } from "@/config/from-the-road-embeds";
import {
  listFromTheRoadPosts,
  listFromTheRoadSocialItems,
  listFromTheRoadYoutubeMoments,
  roadPostExcerpt,
  roadPostImageSrc,
  type RoadPostCard,
  type RoadSocialCardVM,
} from "@/lib/content/content-hub-queries";
import { listUpcomingPublicCampaignEventsForHomepage } from "@/lib/calendar/public-events";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";
import { onTheRoadPageMeta } from "@/content/road/on-the-road";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: onTheRoadPageMeta.title,
  description: onTheRoadPageMeta.description,
  path: "/from-the-road",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function FromTheRoadPage() {
  const embedsConfig = getFromTheRoadEmbedsConfig();
  const [posts, social, youtube, upcomingEvents] = await Promise.all([
    listFromTheRoadPosts(48),
    listFromTheRoadSocialItems(32),
    listFromTheRoadYoutubeMoments(8),
    listUpcomingPublicCampaignEventsForHomepage(4),
  ]);
  const trailGallery = trailPhotosForSlot("fromTheRoad", { fromTheRoadMax: 96 });
  const hasEmbeds = fromTheRoadHasLiveEmbeds(embedsConfig);
  const hasFieldSocial = social.length > 0;
  const hasNotebook = posts.length > 0;
  const hasYoutube = youtube.length > 0;
  const hasTrailPhotos = trailGallery.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-kelly-fog/90 via-white to-kelly-fog/50 pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <OnTheRoadProofSections
          previewPosts={posts}
          upcomingEvents={upcomingEvents}
          trailPhotosAvailable={hasTrailPhotos}
          hasFieldSocial={hasFieldSocial}
        />

        <div className="mt-10 md:mt-14" aria-hidden />

        <FromTheRoadSocialHub />

        {hasTrailPhotos ? (
          <TrailPhotosShowcase
            sectionId="trail-photos"
            variant="woven"
            className="!border-t border-kelly-ink/10 !border-b-0 !pt-14 md:!pt-20"
            photos={trailGallery}
            title="Trail photos — Arkansas, in the room"
            intro="Moments from counties and gatherings across Arkansas—real rooms and real neighbors."
          />
        ) : null}

        <div className="mt-10 md:mt-14" aria-hidden />

        {hasEmbeds ? (
          <section id="live-embeds" className="scroll-mt-24 border-t border-kelly-ink/8 pt-16 md:pt-20" aria-label="Live embeds">
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">Live from our channels</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              Official embeds load here when available—Facebook, TikTok, YouTube, and Instagram highlights in one place.
            </p>
            <FromTheRoadLiveEmbeds config={embedsConfig} />
            <p className="mt-6 max-w-3xl font-body text-xs leading-relaxed text-kelly-slate/55">
              If a widget is blank, third-party cookies or strict privacy modes can block Facebook, Instagram, or TikTok.
              The channel buttons above always open the native site.
            </p>
          </section>
        ) : null}

        <div className="mt-10 md:mt-14" aria-hidden />

        {hasFieldSocial ? (
          <section id="field" className="scroll-mt-24 border-t border-kelly-ink/8 pt-16 md:pt-20" aria-label="Field posts">
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">In the field (Facebook &amp; Instagram)</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              Short updates from the trail on Facebook and Instagram. Open a post for the full thread and comments.
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {social.map((s) => (
                <SocialFieldCard key={s.id} item={s} />
              ))}
            </div>
          </section>
        ) : null}

        {hasNotebook ? (
          <section id="notebook" className="scroll-mt-24 border-t border-kelly-ink/8 pt-16 md:pt-20" aria-label="Writing on Substack">
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">Writing on Substack</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              Longer writing from the road—stories, explainers, and the voice you can share without a platform account
              watching over your shoulder.
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <RoadJournalCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {!hasNotebook && !hasFieldSocial && !hasYoutube && !hasEmbeds ? (
          <p className="mx-auto mt-16 max-w-lg text-center font-body text-kelly-slate/75">
            Trail writing and updates will appear here as they&apos;re published. Check back soon.
          </p>
        ) : null}

        {hasYoutube ? (
          <section
            id="on-camera"
            className="scroll-mt-24 border-t border-kelly-ink/8 pt-16 md:pt-20"
            aria-label="YouTube from the road"
          >
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">On camera (YouTube)</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              Speeches, answers, and short clips that carry the same voice you&apos;d hear in a county room—play only
              when you opt in, here on the page.
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {youtube.map((v) => (
                <article
                  key={v.inboundId}
                  className="overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm"
                >
                  <LazyYouTubeEmbed videoId={v.videoId} title={v.title} posterUrl={v.posterUrl} className="!rounded-none" />
                  <div className="p-4">
                    <h3 className="font-heading text-base font-bold text-kelly-ink">{v.title}</h3>
                    <ContentLocality countySlug={v.countySlug} city={v.city} variant="compact" />
                    {v.canonicalUrl ? (
                      <a
                        href={v.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-body text-xs font-semibold text-kelly-blue hover:underline"
                      >
                        Open on YouTube ↗
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <nav aria-label="Page sections" className="mt-12 border-t border-kelly-ink/8 pt-8 font-body text-sm text-kelly-slate/90">
          <p className="mb-3 font-semibold text-kelly-ink">On this page</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            <li>
              <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#channels">All channels</a>
            </li>
            {hasEmbeds ? (
              <li>
                <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#live-embeds">Live windows</a>
              </li>
            ) : null}
            {hasFieldSocial ? (
              <li>
                <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#field">Field posts</a>
              </li>
            ) : null}
            {hasNotebook ? (
              <li>
                <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#notebook">Writing</a>
              </li>
            ) : null}
            {hasYoutube ? (
              <li>
                <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#on-camera">On camera</a>
              </li>
            ) : null}
            {hasTrailPhotos ? (
              <li>
                <a className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#trail-photos">Trail photos</a>
              </li>
            ) : null}
            <li>
              <Link className="text-kelly-blue underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50" href="#take-action">Take action</Link>
            </li>
          </ul>
        </nav>

        <div className="mx-auto mt-12 max-w-4xl md:mt-16">
          <ContentHubActionBand
            id="take-action"
            title="The trail doesn’t end on the page"
            intro="Reading is a start—democracy still lives in rooms with real chairs. Host, volunteer, or invite us to yours. We’ll bring the respect; you bring the place."
            className="scroll-mt-28 border-kelly-ink/15"
          />
        </div>
      </ContentContainer>
    </div>
  );
}

function RoadJournalCard({ post }: { post: RoadPostCard }) {
  const img = roadPostImageSrc(post);
  const excerpt = roadPostExcerpt(post);
  const date =
    post.publishedAt?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) ?? "";

  return (
    <article
      id={`post-${post.slug}`}
      className="flex flex-col overflow-hidden rounded-card border border-kelly-ink/12 bg-white/95 shadow-md shadow-kelly-ink/5"
    >
      {img ? (
        <div className="relative aspect-[16/10] bg-kelly-navy/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-kelly-blue/15 to-kelly-navy/25 font-body text-xs font-medium text-kelly-ink/70">
          From the trail
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {date ? <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/50">{date}</p> : null}
        <ContentLocality countySlug={post.countySlug} city={post.city} variant="journal" />
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-kelly-ink md:text-xl">
          <Link href={post.canonicalUrl} target="_blank" rel="noreferrer" className="hover:text-kelly-blue">
            {post.title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-3 line-clamp-4 font-body text-sm leading-relaxed text-kelly-slate md:text-[0.9375rem]">{excerpt}</p> : null}
        <Link
          href={post.canonicalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-sm font-bold uppercase tracking-wider text-kelly-blue hover:underline"
        >
          Read the full entry →
        </Link>
      </div>
    </article>
  );
}

function SocialFieldCard({ item }: { item: RoadSocialCardVM }) {
  const date =
    item.publishedAt?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) ?? "";
  const canOpen = item.href !== "#";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-kelly-ink/12 bg-white/95 shadow-md shadow-kelly-ink/5",
        item.platform === ContentPlatform.FACEBOOK && "ring-1 ring-kelly-slate/10",
        item.platform === ContentPlatform.INSTAGRAM && "ring-1 ring-kelly-copper/15",
      )}
    >
      {item.imageSrc ? (
        <div className="relative aspect-[16/10] bg-kelly-navy/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageSrc} alt={item.imageAlt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div
          className={cn(
            "flex aspect-[16/10] items-center justify-center font-body text-xs font-medium text-kelly-ink/60",
            item.platform === ContentPlatform.INSTAGRAM
              ? "bg-gradient-to-br from-fuchsia-900/20 to-amber-900/25"
              : "bg-gradient-to-br from-kelly-blue/20 to-kelly-navy/30",
          )}
        >
          {item.platformLabel}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="inline-flex rounded-full border border-kelly-ink/12 bg-kelly-navy/4 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/80">
            {item.platformLabel} · {item.sourceTypeLabel}
          </span>
          {date ? <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/45">{date}</span> : null}
        </div>
        <ContentLocality countySlug={item.countySlug} city={item.city} variant="journal" />
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-kelly-ink md:text-xl">
          {canOpen ? (
            <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-kelly-blue">
              {item.title}
            </a>
          ) : (
            <span>{item.title}</span>
          )}
        </h3>
        {item.excerpt ? (
          <p className="mt-3 line-clamp-4 font-body text-sm leading-relaxed text-kelly-slate md:text-[0.9375rem]">{item.excerpt}</p>
        ) : null}
        {canOpen ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex text-sm font-bold uppercase tracking-wider text-kelly-blue hover:underline"
          >
            Open on {item.platformLabel} ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}
