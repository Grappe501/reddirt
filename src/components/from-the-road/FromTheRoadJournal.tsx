import Link from "next/link";
import { fromTheRoadJournalCopy } from "@/content/road/on-the-road";
import type { PublicSubstackPost } from "@/lib/integrations/substack/list-public-posts";
import { countiesMentionedInText } from "@/lib/integrations/substack/match-post-counties";
import { SubscribeToKellySubstack } from "@/components/from-the-road/SubscribeToKellySubstack";
import { SubstackArticleBody } from "@/components/from-the-road/SubstackArticleBody";
import { Button } from "@/components/ui/Button";

export function formatJournalDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function JournalCountyLinks({ post }: { post: PublicSubstackPost }) {
  const copy = fromTheRoadJournalCopy;
  const counties = countiesMentionedInText(`${post.title} ${post.summary} ${post.htmlBody}`);
  if (counties.length === 0) return null;
  return (
    <p className="mt-6 font-body text-sm text-kelly-slate">
      {counties.map((c, i) => (
        <span key={c.key}>
          {i > 0 ? " · " : null}
          <Link
            href={`/events/county/${c.key}`}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
          >
            {copy.moreFromCountyCta}: {c.name} County
          </Link>
        </span>
      ))}
    </p>
  );
}

export function JournalPostActions({ post, compact = false }: { post: PublicSubstackPost; compact?: boolean }) {
  const copy = fromTheRoadJournalCopy;
  return (
    <div className={compact ? "mt-6 flex flex-wrap gap-3" : "mt-10 flex flex-wrap gap-3"}>
      <Button href={post.commentUrl} variant={compact ? "outline" : "secondary"}>
        {copy.discussCta}
      </Button>
      <Button href={post.canonicalUrl} variant="outline">
        Open on Substack
      </Button>
    </div>
  );
}

export function LatestFromKelly({ post }: { post: PublicSubstackPost }) {
  const copy = fromTheRoadJournalCopy;
  const when = formatJournalDate(post.publishedAtIso);
  const paywalled = post.isLikelyPaywalled;
  const showHeroImage = Boolean(post.featuredImageUrl) && !/<img\b/i.test(post.htmlBody);

  return (
    <article id="latest" className="scroll-mt-28">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{copy.latestEyebrow}</p>
      <h2 className="mt-3 font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight text-kelly-ink">
        <Link href={post.nativeHref} className="hover:text-kelly-navy">
          {post.title}
        </Link>
      </h2>
      {when ? <p className="mt-3 font-body text-sm text-kelly-slate">{when}</p> : null}
      {showHeroImage ? (
        <div className="mt-8 overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-navy/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImageUrl ?? ""} alt="" className="h-auto w-full object-cover" />
        </div>
      ) : null}
      <div className="mt-8">
        {paywalled ? (
          <>
            <p className="font-body text-lg leading-relaxed text-kelly-text/88">{post.summary}</p>
            <p className="mt-6 rounded-lg border border-kelly-gold/35 bg-kelly-gold/10 p-4 font-body text-sm text-kelly-text/80">
              The full piece is published for Substack readers. Subscribe below, or open it on Substack.
            </p>
          </>
        ) : post.htmlBody ? (
          <SubstackArticleBody html={post.htmlBody} />
        ) : (
          <>
            <p className="font-body text-lg leading-relaxed text-kelly-text/88">{post.summary}</p>
            <div className="mt-6">
              <Button href={post.nativeHref} variant="primary">
                Read this entry
              </Button>
            </div>
          </>
        )}
      </div>
      <JournalCountyLinks post={post} />
      <JournalPostActions post={post} />
    </article>
  );
}

export function JournalArchive({ posts }: { posts: PublicSubstackPost[] }) {
  const copy = fromTheRoadJournalCopy;
  if (posts.length === 0) return null;
  return (
    <section id="journal" className="scroll-mt-28 border-t border-kelly-ink/8 pt-16 md:pt-20" aria-label="Journal archive">
      <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{copy.archiveTitle}</h2>
      <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">{copy.archiveIntro}</p>
      <ol className="mt-10 divide-y divide-kelly-ink/10 border-y border-kelly-ink/10">
        {posts.map((post) => {
          const when = formatJournalDate(post.publishedAtIso);
          return (
            <li key={post.slug} className="py-6">
              <Link href={post.nativeHref} className="group block">
                {when ? (
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/50">{when}</p>
                ) : null}
                <h3 className="mt-2 font-heading text-xl font-bold leading-snug text-kelly-ink group-hover:text-kelly-navy md:text-2xl">
                  {post.title}
                </h3>
                {post.summary ? (
                  <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-slate md:text-base">{post.summary}</p>
                ) : null}
                <p className="mt-3 font-body text-sm font-bold uppercase tracking-wider text-kelly-blue">Read this entry</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function FromTheRoadJournal({ posts }: { posts: PublicSubstackPost[] }) {
  const copy = fromTheRoadJournalCopy;
  const latest = posts[0] ?? null;
  const archive = posts.slice(1);

  return (
    <div className="space-y-14 md:space-y-16">
      <section id="journal-intro" className="max-w-3xl">
        <p className="font-body text-lg leading-relaxed text-kelly-text/88 md:text-xl">{copy.framing}</p>
      </section>
      <SubscribeToKellySubstack />
      {latest ? (
        <LatestFromKelly post={latest} />
      ) : (
        <div className="rounded-card border border-dashed border-kelly-ink/20 bg-white/70 p-8">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink">{copy.emptyTitle}</h2>
          <p className="mt-3 font-body text-kelly-slate">{copy.emptyBody}</p>
        </div>
      )}
      <JournalArchive posts={archive} />
    </div>
  );
}
