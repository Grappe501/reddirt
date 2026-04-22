import type { Metadata } from "next";
import { ContentPlatform } from "@prisma/client";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentHubActionBand } from "@/components/content/ContentHubActionBand";
import { ContentLocality } from "@/components/content/ContentLocality";
import { FromTheRoadLiveEmbeds } from "@/components/from-the-road/FromTheRoadLiveEmbeds";
import { FromTheRoadSocialHub } from "@/components/from-the-road/FromTheRoadSocialHub";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { getFromTheRoadEmbedsConfig, fromTheRoadHasLiveEmbeds } from "@/config/from-the-road-embeds";
import {
  listFromTheRoadPosts,
  listFromTheRoadSocialItems,
  listFromTheRoadYoutubeMoments,
  roadPostExcerpt,
  roadPostImageSrc,
  type RoadPostCard,
  type RoadSocialCardVM,
  type YoutubeCardVM,
} from "@/lib/content/content-hub-queries";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "From the Road",
  description:
    "Official social channels, live embeds, notebook, and field updates in one place—follow the trail without living inside an algorithm.",
  path: "/from-the-road",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function FromTheRoadPage() {
  const embedsConfig = getFromTheRoadEmbedsConfig();
  const [posts, social, youtube] = await Promise.all([
    listFromTheRoadPosts(48),
    listFromTheRoadSocialItems(32),
    listFromTheRoadYoutubeMoments(8),
  ]);
  const hasEmbeds = fromTheRoadHasLiveEmbeds(embedsConfig);
  const hasFieldSocial = social.length > 0;
  const hasNotebook = posts.length > 0;
  const hasYoutube = youtube.length > 0;
  const hasTrailPhotos = campaignTrailPhotos.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-civic-fog/90 via-white to-civic-fog/50 pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-civic-gold">Field journal + trail</p>
          <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-civic-ink">
            From the Road
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            <strong className="text-civic-ink">One bookmark for the whole trail:</strong> Facebook, Instagram, X,
            YouTube, TikTok, and the Substack notebook open from the hub below—then live windows and editor-approved field
            posts stack underneath, so neighbors can follow along without juggling apps or mystery algorithms.
          </p>
          <p className="mt-4 font-body text-sm leading-relaxed text-civic-slate/80 md:text-base md:text-civic-slate/90">
            Channel URLs and optional embeds are driven by{" "}
            <code className="rounded bg-civic-ink/5 px-1 font-mono text-[0.85em]">NEXT_PUBLIC_SOCIAL_*</code> and{" "}
            <code className="rounded bg-civic-ink/5 px-1 font-mono text-[0.85em]">NEXT_PUBLIC_FTR_*</code> in deployment
            env (see <code className="rounded bg-civic-ink/5 px-1 font-mono text-[0.85em]">.env.example</code>)—the same
            values power the site footer.
          </p>
          <p className="mt-5 font-body text-sm text-civic-slate/85">
            <a href="#channels" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              All channels
            </a>
            {hasEmbeds ? (
              <>
                {" · "}
                <a href="#live-embeds" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
                  Live windows
                </a>
              </>
            ) : null}
            {hasFieldSocial ? (
              <>
                {" · "}
                <a href="#field" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
                  Field posts
                </a>
              </>
            ) : null}
            {hasNotebook ? (
              <>
                {" · "}
                <a href="#notebook" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
                  Notebook
                </a>
              </>
            ) : null}
            {hasYoutube ? (
              <>
                {" · "}
                <a href="#on-camera" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
                  On camera
                </a>
              </>
            ) : null}
            {hasTrailPhotos ? (
              <>
                {" · "}
                <a href="#trail-photos" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
                  Trail photos
                </a>
              </>
            ) : null}
            {" · "}
            <Link href="#take-action" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Take action
            </Link>
          </p>
        </header>

        <div className="mt-10 md:mt-12" aria-hidden />

        {hasTrailPhotos ? (
          <TrailPhotosShowcase
            sectionId="trail-photos"
            variant="full"
            className="!border-t-0 !pt-2 md:!pt-4"
            photos={campaignTrailPhotos}
            title="Trail photos — Arkansas, in the room"
            intro="Editor-approved stills from the field: gatherings, counties, and the people who make the movement real. The same library also powers moments on the homepage, About, and Get involved."
          />
        ) : null}

        <FromTheRoadSocialHub />

        <div className="mt-10 md:mt-14" aria-hidden />

        {hasEmbeds ? (
          <section id="live-embeds" className="scroll-mt-24 border-t border-civic-ink/8 pt-16 md:pt-20" aria-label="Live embeds">
            <h2 className="font-heading text-2xl font-bold text-civic-ink md:text-3xl">Live from our channels</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">
              Official embeds load here: Facebook page timeline, hand-picked TikTok clips, optional YouTube uploads
              playlist, and spotlight Instagram posts—set ids in env so this section fills in without extra code deploys.
            </p>
            <FromTheRoadLiveEmbeds config={embedsConfig} />
            <p className="mt-6 max-w-3xl font-body text-xs leading-relaxed text-civic-slate/55">
              If a widget is blank, third-party cookies or strict privacy modes can block Facebook, Instagram, or TikTok.
              The channel buttons above always open the native site.
            </p>
          </section>
        ) : null}

        <div className="mt-10 md:mt-14" aria-hidden />

        {hasFieldSocial ? (
          <section id="field" className="scroll-mt-24 border-t border-civic-ink/8 pt-16 md:pt-20" aria-label="Field posts">
            <h2 className="font-heading text-2xl font-bold text-civic-ink md:text-3xl">In the field (Facebook &amp; Instagram)</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">
              Short updates from the trail—synced from our pages and shown here after a human review in Admin. Follow the
              original post for comments and the full context.
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {social.map((s) => (
                <SocialFieldCard key={s.id} item={s} />
              ))}
            </div>
          </section>
        ) : null}

        {hasFieldSocial && !hasNotebook ? (
          <p className="mx-auto mt-10 max-w-2xl border border-civic-ink/8 bg-civic-midnight/4 px-5 py-4 font-body text-sm leading-relaxed text-civic-slate/90 md:mt-14">
            <strong className="text-civic-ink">Field posts use admin sync + review.</strong> After Facebook/Instagram
            connectors run, editors mark items <strong>Reviewed</strong> in Admin → Inbox so they can appear here.
          </p>
        ) : null}

        {hasNotebook ? (
          <section id="notebook" className="scroll-mt-24 border-t border-civic-ink/8 pt-16 md:pt-20" aria-label="Campaign notebook">
            <h2 className="font-heading text-2xl font-bold text-civic-ink md:text-3xl">The notebook (Substack)</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">
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
          <p className="mx-auto mt-16 max-w-lg text-center font-body text-civic-slate/75">
            There isn&apos;t public road content to show yet. After Substack sync and/or social connectors run—and items
            are approved in the inbox—writing and field updates will show up in the sections above.
          </p>
        ) : null}

        {hasNotebook && !hasFieldSocial ? (
          <p className="mx-auto mt-8 max-w-2xl font-body text-sm text-civic-slate/70 md:mt-10">
            <strong className="text-civic-ink/90">Field posts (Facebook/Instagram):</strong> set connector env in
            production, run platform sync, then mark posts reviewed to surface them in the first section of this page.
          </p>
        ) : null}

        {hasYoutube ? (
          <section
            id="on-camera"
            className="scroll-mt-24 border-t border-civic-ink/8 pt-16 md:pt-20"
            aria-label="YouTube from the road"
          >
            <h2 className="font-heading text-2xl font-bold text-civic-ink md:text-3xl">On camera (YouTube)</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">
              Speeches, answers, and short clips that carry the same voice you&apos;d hear in a county room—play only
              when you opt in, here on the page.
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {youtube.map((v) => (
                <article
                  key={v.inboundId}
                  className="overflow-hidden rounded-card border border-civic-ink/10 bg-white shadow-sm"
                >
                  <LazyYouTubeEmbed videoId={v.videoId} title={v.title} posterUrl={v.posterUrl} className="!rounded-none" />
                  <div className="p-4">
                    <h3 className="font-heading text-base font-bold text-civic-ink">{v.title}</h3>
                    <ContentLocality countySlug={v.countySlug} city={v.city} variant="compact" />
                    {v.canonicalUrl ? (
                      <a
                        href={v.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-body text-xs font-semibold text-civic-blue hover:underline"
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

        <div className="mx-auto mt-20 max-w-4xl md:mt-24">
          <ContentHubActionBand
            id="take-action"
            title="The trail doesn’t end on the page"
            intro="Reading is a start—democracy still lives in rooms with real chairs. Host, volunteer, or invite us to yours. We’ll bring the respect; you bring the place."
            className="scroll-mt-28 border-civic-ink/15"
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
      className="flex flex-col overflow-hidden rounded-card border border-civic-ink/12 bg-white/95 shadow-md shadow-civic-ink/5"
    >
      {img ? (
        <div className="relative aspect-[16/10] bg-civic-midnight/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-civic-blue/15 to-civic-midnight/25 font-body text-xs font-medium text-civic-ink/70">
          Trail notebook
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {date ? <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-slate/50">{date}</p> : null}
        <ContentLocality countySlug={post.countySlug} city={post.city} variant="journal" />
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-civic-ink md:text-xl">
          <Link href={post.canonicalUrl} target="_blank" rel="noreferrer" className="hover:text-civic-blue">
            {post.title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-3 line-clamp-4 font-body text-sm leading-relaxed text-civic-slate md:text-[0.9375rem]">{excerpt}</p> : null}
        <Link
          href={post.canonicalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-sm font-bold uppercase tracking-wider text-civic-blue hover:underline"
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
        "flex flex-col overflow-hidden rounded-card border border-civic-ink/12 bg-white/95 shadow-md shadow-civic-ink/5",
        item.platform === ContentPlatform.FACEBOOK && "ring-1 ring-civic-slate/10",
        item.platform === ContentPlatform.INSTAGRAM && "ring-1 ring-civic-copper/15",
      )}
    >
      {item.imageSrc ? (
        <div className="relative aspect-[16/10] bg-civic-midnight/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageSrc} alt={item.imageAlt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div
          className={cn(
            "flex aspect-[16/10] items-center justify-center font-body text-xs font-medium text-civic-ink/60",
            item.platform === ContentPlatform.INSTAGRAM
              ? "bg-gradient-to-br from-fuchsia-900/20 to-amber-900/25"
              : "bg-gradient-to-br from-civic-blue/20 to-civic-midnight/30",
          )}
        >
          {item.platformLabel}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="inline-flex rounded-full border border-civic-ink/12 bg-civic-midnight/4 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-civic-slate/80">
            {item.platformLabel} · {item.sourceTypeLabel}
          </span>
          {date ? <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-slate/45">{date}</span> : null}
        </div>
        <ContentLocality countySlug={item.countySlug} city={item.city} variant="journal" />
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-civic-ink md:text-xl">
          {canOpen ? (
            <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-civic-blue">
              {item.title}
            </a>
          ) : (
            <span>{item.title}</span>
          )}
        </h3>
        {item.excerpt ? (
          <p className="mt-3 line-clamp-4 font-body text-sm leading-relaxed text-civic-slate md:text-[0.9375rem]">{item.excerpt}</p>
        ) : null}
        {canOpen ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex text-sm font-bold uppercase tracking-wider text-civic-blue hover:underline"
          >
            Open on {item.platformLabel} ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}
