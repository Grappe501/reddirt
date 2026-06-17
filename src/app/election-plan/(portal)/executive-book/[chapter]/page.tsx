import { notFound, redirect } from "next/navigation";

import { ExecutiveBookChapterView } from "@/components/election-plan/executive-book/ExecutiveBookChapterView";
import {
  isExecutiveBookChapterSlug,
} from "@/lib/election-plan/executiveBookChapters";
import { EXECUTIVE_BOOK_EDITION } from "@/lib/election-plan/executiveBookNav";
import { getExecutiveBookChapter, listExecutiveBookChapterSlugs, loadExecutiveBookChapter } from "@/lib/election-plan/loadExecutiveBook";

type Props = {
  params: Promise<{ chapter: string }>;
};

export function generateStaticParams() {
  return listExecutiveBookChapterSlugs().map((chapter) => ({ chapter }));
}

export async function generateMetadata({ params }: Props) {
  const { chapter: slug } = await params;
  if (!isExecutiveBookChapterSlug(slug)) return { title: "Executive Book" };
  const chapter = loadExecutiveBookChapter(slug);
  if (!chapter) return { title: "Executive Book" };
  return {
    title: `${chapter.title} | Executive Book | Kelly Grappe Victory Plan`,
    description: chapter.subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function ExecutiveBookChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  if (!isExecutiveBookChapterSlug(slug)) notFound();

  const routeEntry = getExecutiveBookChapter(slug);
  if (routeEntry?.canonicalSlug) {
    redirect(`/election-plan/executive-book/${routeEntry.canonicalSlug}`);
  }

  const chapter = loadExecutiveBookChapter(slug);
  if (!chapter) notFound();

  return (
    <>
      <div className="ep-classification">
        {EXECUTIVE_BOOK_EDITION.label} · Campaign Operating System · Internal
      </div>
      <ExecutiveBookChapterView chapter={chapter} />
    </>
  );
}
