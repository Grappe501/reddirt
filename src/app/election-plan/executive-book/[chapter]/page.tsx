import { notFound } from "next/navigation";

import { ExecutiveBookChapterView } from "@/components/election-plan/executive-book/ExecutiveBookChapterView";
import {
  isExecutiveBookChapterSlug,
} from "@/lib/election-plan/executiveBookChapters";
import { listExecutiveBookChapterSlugs, loadExecutiveBookChapter } from "@/lib/election-plan/loadExecutiveBook";

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

  const chapter = loadExecutiveBookChapter(slug);
  if (!chapter) notFound();

  return (
    <>
      <div className="ep-classification">Executive Book V1.1 · Leadership Briefing · Internal</div>
      <ExecutiveBookChapterView chapter={chapter} />
    </>
  );
}
