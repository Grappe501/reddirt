import Link from "next/link";
import { notFound } from "next/navigation";
import { FieldBookArticleView } from "@/components/admin/intelligence/FieldBookArticleView";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getAllFieldBookSlugs, getFieldBookArticle, FIELD_BOOK_HUB_HREF } from "@/lib/intelligence/fieldBookRegistry";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllFieldBookSlugs().map((slug) => ({ slug }));
}

export default async function FieldBookArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getFieldBookArticle(slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader eyebrow="The Field Book" title={article.title} description={article.summary}>
        <V4BackLinks />
        <Link
          href={`/admin/intelligence/field-book/phase/${article.phaseId}`}
          className="rounded-full border border-kelly-navy/25 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Back to section
        </Link>
        <Link
          href={FIELD_BOOK_HUB_HREF}
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Field Book home
        </Link>
      </V4PageHeader>

      <FieldBookArticleView article={article} />
    </div>
  );
}
