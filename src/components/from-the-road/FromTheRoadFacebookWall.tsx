import { ContentPlatform } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { facebookPageProfileUrl, facebookUrl } from "@/config/social";
import { siteConfig } from "@/config/site";
import type { RoadSocialCardVM } from "@/lib/content/content-hub-queries";
import { cn } from "@/lib/utils";

type Props = {
  posts: RoadSocialCardVM[];
};

function shareFromTheRoadHref(): string {
  const page = `${siteConfig.url.replace(/\/$/, "")}/from-the-road`;
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(page)}`;
}

function FacebookPostCard({ item, featured = false }: { item: RoadSocialCardVM; featured?: boolean }) {
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
        "flex h-full flex-col overflow-hidden rounded-card border border-kelly-ink/12 bg-white shadow-md shadow-kelly-ink/5",
        featured && "lg:flex-row",
      )}
    >
      {item.imageSrc ? (
        <div className={cn("relative bg-kelly-navy/10", featured ? "aspect-[16/10] lg:w-[46%] lg:shrink-0" : "aspect-[16/10]")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageSrc} alt={item.imageAlt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center bg-gradient-to-br from-kelly-blue/20 to-kelly-navy/30 font-body text-xs font-medium text-kelly-ink/60",
            featured ? "aspect-[16/10] lg:w-[46%] lg:shrink-0" : "aspect-[16/10]",
          )}
        >
          Facebook
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="inline-flex rounded-full border border-kelly-ink/12 bg-kelly-navy/4 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/80">
            Official page
          </span>
          {date ? <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/45">{date}</span> : null}
        </div>
        <h3 className={cn("mt-3 font-heading font-bold leading-snug text-kelly-ink", featured ? "text-xl md:text-2xl" : "text-lg")}>
          {canOpen ? (
            <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-kelly-blue">
              {item.title}
            </a>
          ) : (
            <span>{item.title}</span>
          )}
        </h3>
        {item.excerpt ? (
          <p className={cn("mt-3 font-body leading-relaxed text-kelly-slate", featured ? "text-base" : "line-clamp-4 text-sm")}>
            {item.excerpt}
          </p>
        ) : null}
        {canOpen ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex text-sm font-bold uppercase tracking-wider text-kelly-blue hover:underline"
          >
            Open on Facebook ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Native Facebook wall — campaign design, no Facebook cookies required.
 * Facebook’s Page Plugin timeline often spins forever in private browsers.
 */
export function FromTheRoadFacebookWall({ posts }: Props) {
  const facebookPosts = posts.filter((p) => p.platform === ContentPlatform.FACEBOOK);
  const featured = facebookPosts[0];
  const rest = facebookPosts.slice(1);
  const pageHref = facebookPageProfileUrl();
  const shareHref = shareFromTheRoadHref();

  return (
    <section
      id="facebook-wall"
      className="scroll-mt-24 overflow-hidden rounded-[1.35rem] border border-kelly-ink/10 bg-gradient-to-br from-kelly-navy via-kelly-blue to-kelly-navy p-[1px] shadow-lg shadow-kelly-ink/10"
      aria-label="Kelly on Facebook"
    >
      <div className="rounded-[1.3rem] bg-gradient-to-b from-white via-white to-kelly-fog/70 px-5 py-8 md:px-10 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-kelly-gold">Premier channel</p>
            <h2 className="mt-3 font-heading text-[clamp(1.6rem,3.6vw,2.4rem)] font-bold tracking-tight text-kelly-ink">
              Kelly on Facebook
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
              Trail notes, events, and conversation with neighbors — readable on this site. Tap through for comments and
              shares on the official page.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={pageHref} variant="primary">
              Follow on Facebook
            </Button>
            <Button href={shareHref} variant="secondary">
              Share this page
            </Button>
            <Button href={facebookUrl()} variant="outline">
              Open Facebook
            </Button>
          </div>
        </div>

        {featured ? (
          <div className="mt-10 space-y-6">
            <FacebookPostCard item={featured} featured />
            {rest.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {rest.map((item) => (
                  <FacebookPostCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 rounded-card border border-kelly-ink/10 bg-white/90 px-5 py-8 md:px-8">
            <p className="font-heading text-xl font-bold text-kelly-ink">Facebook’s in-page window often never finishes</p>
            <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate">
              That spinner is Facebook blocking its own timeline in many browsers. This wall is the campaign’s copy of
              the public Page — follow the official page now, and the same posts will appear here as they are connected.
            </p>
            <p className="mt-4 font-body text-sm text-kelly-slate/80">
              Comments and reactions stay on Facebook. We do not ask visitors to log into Facebook to read this site.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
