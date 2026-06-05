import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  FIELD_BOOK_HUB_HREF,
  getFieldBookArticlesForPhase,
  getFieldBookPhase,
  type FieldBookPhaseId,
} from "@/lib/intelligence/fieldBookRegistry";

export const dynamic = "force-dynamic";

const VALID_PHASES: FieldBookPhaseId[] = ["phase-a", "phase-b", "phase-c", "phase-d"];

export function generateStaticParams() {
  return VALID_PHASES.map((phaseId) => ({ phaseId }));
}

export default async function FieldBookPhasePage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  if (!VALID_PHASES.includes(phaseId as FieldBookPhaseId)) notFound();

  const phase = getFieldBookPhase(phaseId)!;
  const articles = getFieldBookArticlesForPhase(phaseId as FieldBookPhaseId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader eyebrow="The Field Book" title={phase.label} description={phase.tagline}>
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_HUB_HREF}
          className="rounded-full border border-kelly-navy/25 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Field Book home
        </Link>
      </V4PageHeader>

      <div className={`rounded-xl border-2 p-5 ${phase.borderClass}`}>
        <p className={`text-sm font-bold ${phase.colorClass}`}>
          {articles.length} articles · cross-linked encyclopedia section
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/admin/intelligence/field-book/${a.slug}`}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-kelly-text/10 bg-white p-4 hover:border-kelly-navy/25"
            >
              <div>
                <p className="font-heading text-lg font-bold text-kelly-navy">{a.title}</p>
                <p className="mt-1 text-sm text-kelly-muted">{a.summary}</p>
              </div>
              <span className="text-[10px] font-bold uppercase text-kelly-subtle">{a.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
