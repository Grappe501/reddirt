import type { BlogDisplayMode, SyncedPost } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SyncedPostWithHero = SyncedPost & {
  heroMedia: { url: string; alt: string | null } | null;
};

function excerptForMode(summary: string, mode: BlogDisplayMode): string {
  const t = summary.trim();
  if (mode === "EXCERPT_LINK") return t.length > 420 ? `${t.slice(0, 417)}…` : t;
  if (mode === "INTERNAL_MIRROR_TODO") return t.length > 360 ? `${t.slice(0, 357)}…` : t;
  return t.length > 220 ? `${t.slice(0, 217)}…` : t;
}

export type HomepageBlogCard = {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  canonicalUrl: string;
  publishedAt: Date | null;
  imageSrc?: string;
  imageAlt: string;
  displayMode: BlogDisplayMode;
};

export function toBlogCard(post: SyncedPostWithHero): HomepageBlogCard {
  const teaser = post.teaserOverride?.trim() || post.summary;
  const excerpt = excerptForMode(teaser, post.displayMode);
  const imageSrc = post.heroMedia?.url ?? post.featuredImageUrl ?? undefined;
  const imageAlt = post.heroMedia?.alt?.trim() || post.title;
  return {
    slug: post.slug,
    title: post.title,
    excerpt,
    href: `/blog/${post.slug}`,
    canonicalUrl: post.canonicalUrl,
    publishedAt: post.publishedAt,
    imageSrc,
    imageAlt,
    displayMode: post.displayMode,
  };
}

export async function getHomepageSyncedPosts(slugs: string[]): Promise<SyncedPostWithHero[]> {
  try {
    if (slugs.length > 0) {
      const found = await prisma.syncedPost.findMany({
        where: { slug: { in: slugs }, hidden: false },
        include: { heroMedia: true },
      });
      const order = new Map(slugs.map((s, i) => [s, i]));
      return found.sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
    }
    return await prisma.syncedPost.findMany({
      where: { showOnHomepage: true, hidden: false },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { heroMedia: true },
    });
  } catch {
    return [];
  }
}

export async function listPublicBlogPosts(): Promise<SyncedPostWithHero[]> {
  try {
    return await prisma.syncedPost.findMany({
      where: { hidden: false, showOnBlogLanding: true },
      orderBy: { publishedAt: "desc" },
      include: { heroMedia: true },
    });
  } catch {
    return [];
  }
}

export async function getPublicBlogPostBySlug(slug: string): Promise<SyncedPostWithHero | null> {
  try {
    return await prisma.syncedPost.findFirst({
      where: { slug, hidden: false },
      include: { heroMedia: true },
    });
  } catch {
    return null;
  }
}
