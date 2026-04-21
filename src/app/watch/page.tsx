import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { ContentHubActionBand } from "@/components/content/ContentHubActionBand";
import { ContentLocality } from "@/components/content/ContentLocality";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { getFeaturedYoutubeForHub, loadAllWatchRails } from "@/lib/content/content-hub-queries";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Watch Kelly",
  description:
    "Hear Kelly Grappe on democracy, counties, and the Secretary of State’s office—curated for Arkansans, not algorithms.",
  path: "/watch",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function WatchPage() {
  const homepage = await getMergedHomepageConfig();
  const [hero, rails] = await Promise.all([
    getFeaturedYoutubeForHub(homepage.featuredHomepageVideoInboundId),
    loadAllWatchRails(),
  ]);

  return (
    <main className="min-h-screen bg-civic-fog pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-red-dirt">Kelly Grappe</p>
          <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-civic-ink">
            Watch Kelly—on your time, in plain language
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            You shouldn’t have to wade through a platform feed to understand who we are. This page is the campaign’s
            living room: speeches, answers, and road moments—organized around the stakes that matter to real Arkansas
            families, clerks, and counties.
          </p>
          <p className="mt-4 font-body text-base leading-relaxed text-civic-slate/90">
            Press play when you’re ready. We load the player only after you choose to—fast pages, fewer third‑party
            surprises, same voice you’ll hear in the field.
          </p>
          <p className="mt-5 font-body text-sm text-civic-slate/85">
            <Link href="#take-action" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Ready to do something with what you watched?
            </Link>{" "}
            ·{" "}
            <Link href="/from-the-road" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Read the trail notebook
            </Link>
          </p>
        </header>

        {hero ? (
          <section className="mx-auto mt-14 max-w-4xl" aria-labelledby="watch-hero-heading">
            <div className="text-center">
              <h2 id="watch-hero-heading" className="font-heading text-lg font-bold text-civic-ink md:text-xl">
                Start here
              </h2>
              <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-relaxed text-civic-slate md:text-base">
                Our featured clip changes when the trail does. It’s chosen by the campaign—not by whatever an algorithm
                thinks you’ll click next.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-card border border-civic-ink/10 bg-civic-midnight shadow-2xl shadow-black/15">
              <LazyYouTubeEmbed videoId={hero.videoId} title={hero.title} posterUrl={hero.posterUrl} />
            </div>
            <p className="mt-4 text-center font-body text-sm font-medium text-civic-ink/90">{hero.title}</p>
            <ContentLocality countySlug={hero.countySlug} city={hero.city} className="justify-center" variant="compact" />
          </section>
        ) : (
          <div className="mx-auto mt-14 max-w-xl rounded-card border border-civic-ink/10 bg-white/80 px-6 py-8 text-center shadow-sm">
            <p className="font-body text-sm leading-relaxed text-civic-slate">
              Clips appear here after YouTube sync runs and at least one video is marked <strong>Reviewed</strong> or{" "}
              <strong>Featured</strong> in Admin → Inbox—or when you set a curated homepage video id. New ingests stay{" "}
              <strong>Pending</strong> until a human clears them: that keeps “synced” and “public” honest.
            </p>
          </div>
        )}

        <div className="mx-auto mt-14 max-w-4xl">
          <ContentHubActionBand
            id="take-action"
            intro="If something you heard matches your county, your club, or your conscience—raise your hand. We build this campaign in public, and we mean it."
            className="scroll-mt-28"
          />
        </div>

        <div className="mt-20 space-y-20 md:mt-24 md:space-y-24">
          {rails.map(({ def, videos }) => (
            <section key={def.id} id={def.id} className="scroll-mt-28" aria-labelledby={`rail-${def.id}`}>
              <div className="max-w-3xl">
                <h2 id={`rail-${def.id}`} className="font-heading text-2xl font-bold text-civic-ink md:text-[1.65rem]">
                  {def.title}
                </h2>
                <p className="mt-3 font-body text-base leading-relaxed text-civic-slate md:text-lg">{def.strapline}</p>
                <details className="mt-4 max-w-2xl">
                  <summary className="cursor-pointer font-body text-xs font-semibold uppercase tracking-wider text-civic-slate/50">
                    For organizers &amp; editors
                  </summary>
                  <p className="mt-2 font-body text-xs leading-relaxed text-civic-slate/65">
                    Route clips into this row by setting <code className="rounded bg-civic-ink/5 px-1 font-mono">{def.contentSeries ?? "contentSeries"}</code>{" "}
                    (or matching issue tags) on the inbound YouTube row in Admin.
                  </p>
                </details>
              </div>
              {videos.length === 0 ? (
                <p className="mt-8 font-body text-sm italic text-civic-slate/75">
                  We’re saving this space on purpose—when the trail gives us the right moment for this theme, it’ll land
                  here first.
                </p>
              ) : (
                <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v) => (
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
              )}
            </section>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-4xl md:mt-24">
          <ContentHubActionBand
            title="Turn what you watched into a next step"
            intro="Same invitation, whether you watched one clip or ten: Arkansas moves when neighbors act. Pick the lane that fits your life—we’ll meet you there."
          />
        </div>
      </ContentContainer>
    </main>
  );
}
