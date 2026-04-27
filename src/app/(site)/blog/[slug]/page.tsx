import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { articleMeta } from "@/lib/seo/metadata";
import { getPublicBlogPostBySlug, toBlogCard } from "@/lib/content/blog-public";
import { prisma } from "@/lib/db";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await prisma.syncedPost.findMany({
      where: { hidden: false },
      select: { slug: true },
    });
    return slugs.map((s) => ({ slug: s.slug }));
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("blog/generateStaticParams", e);
    } else {
      console.error("[blog/generateStaticParams]", e);
    }
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) return { title: "Writing" };
  const card = toBlogCard(post);
  return articleMeta({
    title: post.title,
    description: card.excerpt,
    path: `/blog/${post.slug}`,
    imageSrc: card.imageSrc,
    publishedTime: post.publishedAt?.toISOString(),
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) notFound();

  const card = toBlogCard(post);
  const isMirrorTodo = post.displayMode === "INTERNAL_MIRROR_TODO";

  return (
    <>
      <FullBleedSection padY className="border-b border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-slate">From Substack</p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-kelly-text lg:text-5xl">{post.title}</h1>
          {post.author ? (
            <p className="mt-3 font-body text-sm text-kelly-text/65">By {post.author}</p>
          ) : null}
          {post.publishedAt ? (
            <p className="mt-2 font-body text-sm text-kelly-text/55">
              {post.publishedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-8 shadow-[var(--shadow-soft)] md:p-10">
            <p className="font-body text-lg leading-relaxed text-kelly-text/85">{card.excerpt}</p>
            {isMirrorTodo ? (
              <p className="mt-6 rounded-lg border border-kelly-gold/35 bg-kelly-gold/10 p-4 font-body text-sm text-kelly-text/80">
                <strong className="text-kelly-text">Full essay on Substack.</strong> This page is a preview for now—open the
                link below to read the complete piece.
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href={post.canonicalUrl} variant="primary" rel="noopener noreferrer" target="_blank">
                Read on Substack
              </Button>
              <Button href="/blog" variant="outline">
                Back to writing
              </Button>
            </div>
            <p className="mt-8 font-body text-xs text-kelly-text/50">
              Original post:{" "}
              <Link href={post.canonicalUrl} className="break-all text-kelly-navy underline" rel="noopener noreferrer" target="_blank">
                {post.canonicalUrl}
              </Link>
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
