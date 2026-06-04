import Link from "next/link";
import { notFound } from "next/navigation";
import { V4DebatePsychologyManualSectionPanel } from "@/components/admin/intelligence/v4/V4DebatePsychologyManualPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  getAllDebatePsychologyManualSectionIds,
  getDebatePsychologyManualSection,
  listDebatePsychologyManualSections,
} from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return getAllDebatePsychologyManualSectionIds().map((sectionId) => ({ sectionId }));
}

type PageProps = { params: Promise<{ sectionId: string }> };

export default async function DebatePsychologyManualSectionPage({ params }: PageProps) {
  const { sectionId } = await params;
  const section = getDebatePsychologyManualSection(sectionId);
  if (!section) notFound();

  const sections = listDebatePsychologyManualSections();
  const idx = sections.findIndex((s) => s.sectionId === sectionId);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx >= 0 && idx < sections.length - 1 ? sections[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Psychology manual · Part ${section.partNumber} · ${section.eyebrow}`}
        title={section.title}
        description={section.whyItMattersForKelly}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-prep/psychology-manual"
          className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          All sections
        </Link>
      </V4PageHeader>

      <V4DebatePsychologyManualSectionPanel sectionId={sectionId} />

      <nav className="mt-8 flex flex-wrap justify-between gap-2 border-t border-kelly-text/10 pt-6 text-xs font-bold">
        {prev ? (
          <Link
            href={`/admin/intelligence/debate-prep/psychology-manual/${prev.sectionId}`}
            className="text-kelly-navy underline"
          >
            ← Part {prev.partNumber}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/admin/intelligence/debate-prep/psychology-manual/${next.sectionId}`}
            className="text-kelly-navy underline"
          >
            Part {next.partNumber}: {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
