import Link from "next/link";
import { notFound } from "next/navigation";

import { ExecutiveBookMarkdown } from "@/components/election-plan/executive-book/ExecutiveBookMarkdown";
import { loadBudgetDocumentMarkdown } from "@/lib/election-plan/load-budget-document";
import { BUDGET_SUPPORTING_DOCUMENTS } from "@/lib/election-plan/budget-documents-registry";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BUDGET_SUPPORTING_DOCUMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const loaded = loadBudgetDocumentMarkdown(slug);
  if (!loaded) return { title: "Budget document" };
  return {
    title: `${loaded.doc.title} | Campaign Budget`,
    robots: { index: false, follow: false },
  };
}

export default async function BudgetDocumentPage({ params }: Props) {
  const { slug } = await params;
  const loaded = loadBudgetDocumentMarkdown(slug);
  if (!loaded) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Supporting budget document · Planning only</div>
      <header className="ep-chapter-header px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-white/70" aria-label="Breadcrumb">
            <Link href="/election-plan" className="hover:text-white">
              Election Plan
            </Link>
            <span className="mx-2">/</span>
            <Link href="/election-plan/executive-book/budget" className="hover:text-white">
              Budget
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{loaded.doc.title}</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white lg:text-4xl">
            {loaded.doc.title}
          </h1>
          <p className="mt-2 text-sm text-white/70">{loaded.doc.file}</p>
        </div>
      </header>
      <main className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="ep-card ep-chapter-article">
            <ExecutiveBookMarkdown markdown={loaded.markdown} />
          </div>
          <p className="mt-6">
            <Link href="/election-plan/executive-book/budget" className="ep-chapter-link">
              ← Back to campaign budget chapter
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
