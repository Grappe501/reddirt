import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import {
  BIOGRAPHY_CHAPTERS,
  getBiographyChapter,
  isBiographyChapterSlug,
} from "@/content/biography/biography-config";
import { canAccessBiographyDeepDive } from "@/lib/biographyAccess";
import { pageMeta } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BIOGRAPHY_CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isBiographyChapterSlug(slug)) return {};
  const c = getBiographyChapter(slug);
  if (!c) return {};
  return pageMeta({
    title: `${c.title} — Biography`,
    description: `Biography chapter: ${c.title}. Kelly Grappe for Arkansas Secretary of State.`,
    path: `/about/deep-dive/${c.slug}`,
    imageSrc: "/media/placeholders/texture-porch-glow.svg",
  });
}

async function loadChapterMarkdown(filename: string): Promise<string> {
  const root = path.join(process.cwd(), "src", "content", "biography", "chapters");
  const full = path.join(root, filename);
  return fs.readFile(full, "utf8");
}

export default async function BiographyDeepDivePage({ params }: PageProps) {
  const { slug: raw } = await params;
  if (!canAccessBiographyDeepDive()) notFound();
  if (!isBiographyChapterSlug(raw)) notFound();
  const c = getBiographyChapter(raw);
  if (!c) notFound();

  const md = await loadChapterMarkdown(c.filename);
  const body =
    md
      .replace(/^#\s+.+\n+/, "")
      .trim() || "Draft in progress.";

  const eyebrow = c.slug === "epilogue" ? "Closing" : `Chapter ${c.order}`;

  return (
    <>
      <PageHero eyebrow={eyebrow} title={c.title} subtitle="Deep-dive manuscript — draft.">
        <Link href="/biography" className="inline-flex items-center justify-center rounded-full border border-kelly-text/20 px-5 py-2 text-sm font-semibold text-kelly-text hover:bg-kelly-text/5">
          Chapter list
        </Link>
        <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-kelly-text/20 px-5 py-2 text-sm font-semibold text-kelly-text hover:bg-kelly-text/5">
          Meet Kelly
        </Link>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <article className="font-body text-lg leading-relaxed text-kelly-text/88 whitespace-pre-wrap">{body}</article>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
