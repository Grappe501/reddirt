import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  formatJournalDate,
  JournalCountyLinks,
  JournalPostActions,
} from "@/components/from-the-road/FromTheRoadJournal";
import { SubscribeToKellySubstack } from "@/components/from-the-road/SubscribeToKellySubstack";
import { SubstackArticleBody } from "@/components/from-the-road/SubstackArticleBody";
import { fromTheRoadJournalCopy } from "@/content/road/on-the-road";
import { getPublicSubstackPostBySlug } from "@/lib/integrations/substack/list-public-posts";
import { articleMeta } from "@/lib/seo/metadata";

export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicSubstackPostBySlug(slug);
  if (!post) return { title: fromTheRoadJournalCopy.title };
  return articleMeta({
    title: post.title,
    description: post.summary,
    path: post.nativeHref,
    imageSrc: post.featuredImageUrl ?? undefined,
    publishedTime: post.publishedAtIso ?? undefined,
  });
}

export default async function FromTheRoadArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicSubstackPostBySlug(slug);
  if (!post) notFound();

  const when = formatJournalDate(post.publishedAtIso);
  const showHeroImage = Boolean(post.featuredImageUrl) && !/<img\b/i.test(post.htmlBody);
  const copy = fromTheRoadJournalCopy;

  return (
    <>
      <FullBleedSection padY className="border-b border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{copy.eyebrow}</p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-kelly-ink lg:text-5xl">{post.title}</h1>
          {when ? <p className="mt-4 font-body text-sm text-kelly-slate">{when}</p> : null}
          <p className="mt-4 font-body text-sm text-kelly-slate/80">
            <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Back to From the Road
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          {showHeroImage ? (
            <div className="mb-10 overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-navy/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.featuredImageUrl ?? ""} alt="" className="h-auto w-full object-cover" />
            </div>
          ) : null}

          {post.isLikelyPaywalled ? (
            <>
              <p className="font-body text-lg leading-relaxed text-kelly-text/88">{post.summary}</p>
              <p className="mt-6 rounded-lg border border-kelly-gold/35 bg-kelly-gold/10 p-4 font-body text-sm text-kelly-text/80">
                The full piece is published for Substack readers. Subscribe below, or open it on Substack.
              </p>
            </>
          ) : (
            <SubstackArticleBody html={post.htmlBody} />
          )}

          <JournalCountyLinks post={post} />
          <JournalPostActions post={post} />

          <div className="mt-14">
            <SubscribeToKellySubstack />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/from-the-road" variant="outline">
              All From the Road entries
            </Button>
            <Button href="/events" variant="ghost">
              Campaign events
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
