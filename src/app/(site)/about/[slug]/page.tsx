import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { AboutKellyChapterNav } from "@/components/about/AboutKellyChapterNav";
import { KellyChapterBody } from "@/components/about/KellyChapterBody";
import {
  KELLY_ABOUT_CHAPTERS,
  isKellyAboutSlug,
  getKellyAboutChapter,
  type KellyAboutSlug,
} from "@/content/about/kelly-about-chapters";
import { pageMeta } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return KELLY_ABOUT_CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  if (!isKellyAboutSlug(raw)) return {};
  const c = getKellyAboutChapter(raw);
  if (!c) return {};
  return pageMeta({
    title: `${c.title} — Meet Kelly`,
    description: c.description,
    path: `/about/${c.slug}`,
    imageSrc: "/media/placeholders/texture-porch-glow.svg",
  });
}

export default async function AboutChapterPage({ params }: PageProps) {
  const { slug: raw } = await params;
  if (!isKellyAboutSlug(raw)) notFound();
  const slug = raw as KellyAboutSlug;
  const c = getKellyAboutChapter(slug);
  if (!c) notFound();

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} subtitle={c.summary}>
        <Button href="/about" variant="outline">
          Back to overview
        </Button>
        <Button href="/priorities" variant="outline">
          Office priorities
        </Button>
        <Button href="/get-involved" variant="primary">
          Get involved
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY={false} className="border-b border-deep-soil/8">
        <ContentContainer className="max-w-3xl py-8 sm:py-10 lg:py-12">
          <KellyChapterBody slug={slug} />
          <AboutKellyChapterNav slug={slug} />
          <p className="mt-8 font-body text-sm text-deep-soil/65">
            <Link href="/about" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
              Return to the Meet Kelly overview
            </Link>{" "}
            for the full list of chapters.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
