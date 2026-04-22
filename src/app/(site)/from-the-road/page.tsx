import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentHubActionBand } from "@/components/content/ContentHubActionBand";
import { ContentLocality } from "@/components/content/ContentLocality";
import { listFromTheRoadPosts, roadPostExcerpt, roadPostImageSrc, type RoadPostCard } from "@/lib/content/content-hub-queries";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "From the Road",
  description:
    "A field journal from Kelly Grappe’s campaign for Secretary of State—listening, learning, and showing up across Arkansas.",
  path: "/from-the-road",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function FromTheRoadPage() {
  const posts = await listFromTheRoadPosts(48);

  return (
    <main className="min-h-screen bg-gradient-to-b from-civic-fog/90 via-white to-civic-fog/50 pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-civic-gold">Field journal</p>
          <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-civic-ink">
            From the Road
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            This isn’t a social feed—it’s the trail, written down. Notebook entries from stops across Arkansas: what we
            heard in break rooms and on courthouse squares, what we’re learning from clerks and neighbors, and how showing
            up builds the trust this office has to earn.
          </p>
          <p className="mt-4 font-body text-base leading-relaxed text-civic-slate/90">
            Substack stays a great publishing tool; <strong className="text-civic-ink">this page is the campaign’s
            front porch</strong>—readable, shareable, and rooted in Kelly’s voice.
          </p>
          <p className="mt-5 font-body text-sm text-civic-slate/85">
            <Link href="/watch" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Watch Kelly by theme
            </Link>
            {" · "}
            <Link href="#take-action" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Take action from what you read
            </Link>
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-4xl">
          <ContentHubActionBand
            id="take-action"
            intro="If a stop sounds like your county, your union hall, or your church basement—we want to meet you there too. Tell us how to show up."
            className="scroll-mt-28 border-civic-ink/15"
          />
        </div>

        {posts.length === 0 ? (
          <p className="mx-auto mt-16 max-w-lg text-center font-body text-civic-slate/75">
            Run Substack sync from admin after configuring the feed URL—stories will appear here when they’re public on
            the notebook and not hidden.
          </p>
        ) : (
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RoadJournalCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mx-auto mt-20 max-w-4xl md:mt-24">
          <ContentHubActionBand
            title="The trail doesn’t end on the page"
            intro="Reading is a start—democracy still lives in rooms with real chairs. Host, volunteer, or invite us to yours. We’ll bring the respect; you bring the place."
          />
        </div>
      </ContentContainer>
    </main>
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
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-civic-ink/12 bg-white/95 shadow-md shadow-civic-ink/5",
      )}
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
        {date ? (
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-slate/50">{date}</p>
        ) : null}
        <ContentLocality countySlug={post.countySlug} city={post.city} variant="journal" />
        <h2 className="mt-3 font-heading text-lg font-bold leading-snug text-civic-ink md:text-xl">
          <Link href={post.canonicalUrl} target="_blank" rel="noreferrer" className="hover:text-civic-blue">
            {post.title}
          </Link>
        </h2>
        {excerpt ? (
          <p className="mt-3 line-clamp-4 font-body text-sm leading-relaxed text-civic-slate md:text-[0.9375rem]">{excerpt}</p>
        ) : null}
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
