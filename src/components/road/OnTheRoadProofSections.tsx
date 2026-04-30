import Link from "next/link";
import { onTheRoadProofCopy } from "@/content/road/on-the-road";
import { roadPostExcerpt, roadPostImageSrc, type RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { cn } from "@/lib/utils";

type OnTheRoadProofSectionsProps = {
  previewPosts: RoadPostCard[];
  upcomingEvents: PublicCampaignEvent[];
  trailPhotosAvailable?: boolean;
};

function ArkansasTrailMapPlaceholder() {
  const { map } = onTheRoadProofCopy;
  return (
    <div
      className="rounded-card border-2 border-dashed border-kelly-ink/20 bg-gradient-to-br from-kelly-fog/80 via-white to-kelly-wash/60 p-6 md:p-10"
      role="img"
      aria-label={map.placeholderAriaLabel}
    >
      <div className="mx-auto max-w-md text-center">
        <svg className="mx-auto h-32 w-full max-w-[14rem] text-kelly-navy/25 motion-reduce:transition-none" viewBox="0 0 120 140" aria-hidden="true">
          <rect x="8" y="12" width="104" height="116" rx="12" fill="currentColor" opacity="0.35" />
          <path
            d="M24 38h72M24 58h56M24 78h64M24 98h48"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
        <p className="mt-4 font-heading text-sm font-bold text-kelly-ink md:text-base">{map.title}</p>
        <p className="mt-2 font-body text-xs leading-relaxed text-kelly-slate md:text-sm">{map.placeholderCaption}</p>
      </div>
    </div>
  );
}

function ProofMetricCard({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: string;
  note: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-kelly-ink/10 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6 min-h-[7.5rem]",
        className,
      )}
    >
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-slate/60 md:text-[11px]">{label}</p>
      <p className="mt-2 font-heading text-xl font-bold text-kelly-ink sm:text-2xl md:text-[1.75rem]">{value}</p>
      <p className="mt-2 font-body text-xs leading-relaxed text-kelly-slate/85 md:text-sm">{note}</p>
    </div>
  );
}

function ProofPostSnapshot({ post }: { post: RoadPostCard }) {
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
      id={`story-${post.slug}`}
      className="flex h-full flex-col overflow-hidden rounded-card border border-kelly-ink/12 bg-white/95 shadow-sm"
    >
      {img ? (
        <div className="relative aspect-[16/10] bg-kelly-navy/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-kelly-wash font-body text-xs font-medium text-kelly-slate/70">
          From the trail
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {date ? <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-slate/50">{date}</p> : null}
        <h3 className="mt-1 font-heading text-base font-bold leading-snug text-kelly-ink md:text-lg">
          <Link href={post.canonicalUrl} target="_blank" rel="noreferrer" className="hover:text-kelly-blue">
            {post.title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-kelly-slate">{excerpt}</p> : null}
        <Link
          href={post.canonicalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-xs font-bold uppercase tracking-wider text-kelly-blue hover:underline md:text-sm"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}

export function OnTheRoadProofSections({
  previewPosts,
  upcomingEvents,
  trailPhotosAvailable = false,
}: OnTheRoadProofSectionsProps) {
  const c = onTheRoadProofCopy;
  const storyPosts = previewPosts.slice(0, 3);
  const showLiveStories = storyPosts.length > 0;

  return (
    <>
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{c.hero.eyebrow}</p>
        <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-kelly-ink">
          {c.hero.title}
        </h1>
        <p className="mt-5 font-body text-lg font-medium text-kelly-ink md:text-xl">{c.hero.subtitle}</p>
        {c.hero.bodyParagraphs.map((p) => (
          <p key={p.slice(0, 24)} className="mt-5 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
            {p}
          </p>
        ))}
        <p className="mt-6 font-body text-sm font-medium italic text-kelly-navy/90 md:text-base">{c.hero.messageLine}</p>
      </header>

      <section className="mt-14 scroll-mt-24 md:mt-16" aria-labelledby="on-road-metrics-heading">
        <h2 id="on-road-metrics-heading" className="text-center font-heading text-xl font-bold text-kelly-ink md:text-2xl">
          {c.metrics.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm leading-relaxed text-kelly-slate md:text-base">
          {c.metrics.intro}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.metrics.items.map((m) => (
            <ProofMetricCard key={m.label} label={m.label} value={m.value} note={m.note} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ProofMetricCard
            label={c.metrics.countyPlaceholderLabel}
            value="—"
            note="TODO: verified count from campaign records (do not invent)."
          />
          <ProofMetricCard
            label={c.metrics.cityPlaceholderLabel}
            value="—"
            note="TODO: verified count from campaign records (do not invent)."
          />
        </div>
      </section>

      <section className="mt-16 scroll-mt-24 md:mt-20" aria-labelledby="on-road-community-heading">
        <h2 id="on-road-community-heading" className="text-center font-heading text-xl font-bold text-kelly-ink md:text-2xl">
          {c.community.title}
        </h2>
        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 px-1 font-body text-sm text-kelly-ink md:text-base">
          {c.community.list.map((item) => (
            <li
              key={item}
              className="rounded-full border border-kelly-ink/12 bg-white/90 px-3 py-1.5 font-medium text-kelly-slate md:px-4 md:py-2"
            >
              {item}
            </li>
          ))}
        </ul>
        {c.community.bodyParagraphs.map((p) => (
          <p key={p.slice(0, 28)} className="mx-auto mt-8 max-w-3xl text-center font-body text-base leading-relaxed text-kelly-slate md:text-lg">
            {p}
          </p>
        ))}
      </section>

      <section className="mt-16 scroll-mt-24 md:mt-20" aria-labelledby="on-road-map-heading">
        <h2 id="on-road-map-heading" className="sr-only">
          {c.map.title}
        </h2>
        <ArkansasTrailMapPlaceholder />
      </section>

      {upcomingEvents.length > 0 ? (
        <section className="mt-14 scroll-mt-24 md:mt-16" aria-labelledby="on-road-events-heading">
          <h2 id="on-road-events-heading" className="text-center font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            Upcoming public stops
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm text-kelly-slate">
            Published on the campaign calendar—details on each page.
          </p>
          <ul className="mx-auto mt-8 max-w-2xl space-y-3 font-body">
            {upcomingEvents.slice(0, 4).map((e) => (
              <li key={e.id} className="rounded-card border border-kelly-ink/10 bg-white/95 px-4 py-3 shadow-sm md:px-5 md:py-4">
                <Link href={e.detailHref} className="font-heading text-base font-bold text-kelly-navy hover:text-kelly-blue hover:underline">
                  {e.title}
                </Link>
                <p className="mt-1 text-sm text-kelly-slate">
                  {e.startAt.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: e.timezone,
                  })}
                  {e.county ? ` · ${e.county.displayName}` : null}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center">
            <Link href="/events" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
              Full events calendar →
            </Link>
          </p>
        </section>
      ) : null}

      <section className="mt-16 scroll-mt-24 md:mt-20" aria-labelledby="on-road-stories-heading">
        <h2 id="on-road-stories-heading" className="text-center font-heading text-xl font-bold text-kelly-ink md:text-2xl">
          {c.stories.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm leading-relaxed text-kelly-slate md:text-base">
          {showLiveStories ? c.stories.introWhenFeed : c.stories.introWhenPlaceholder}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showLiveStories
            ? storyPosts.map((post) => <ProofPostSnapshot key={post.id} post={post} />)
            : c.stories.placeholders.map((card) => (
                <article
                  key={card.id}
                  className="flex h-full flex-col rounded-card border border-kelly-ink/12 bg-white/95 p-5 shadow-sm md:p-6"
                >
                  <h3 className="font-heading text-base font-bold text-kelly-ink md:text-lg">{card.title}</h3>
                  <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate md:text-[0.9375rem]">{card.body}</p>
                </article>
              ))}
        </div>
      </section>

      <div className="mx-auto mt-16 max-w-3xl border-t border-kelly-ink/10 pt-14 text-center md:mt-20 md:pt-16">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{c.hubHandoff.eyebrow}</p>
        <h2 className="mt-3 font-heading text-xl font-bold text-kelly-ink md:text-2xl">{c.hubHandoff.title}</h2>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">{c.hubHandoff.body}</p>
        <p className="mt-6 font-body text-sm text-kelly-slate">
          <a href="#channels" className="rounded-sm font-semibold text-kelly-blue underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50">
            Jump to all channels
          </a>
          {trailPhotosAvailable ? (
            <>
              {" · "}
              <a
                href="#trail-photos"
                className="rounded-sm font-semibold text-kelly-blue underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
              >
                Trail photos
              </a>
            </>
          ) : null}
        </p>
      </div>
    </>
  );
}
