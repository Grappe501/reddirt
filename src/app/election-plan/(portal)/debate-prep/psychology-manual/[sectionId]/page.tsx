import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanPsychologyManualSectionPanel } from "@/components/election-plan/ElectionPlanPsychologyManualPanels";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { EP_DEBATE_PREP_PSYCHOLOGY_HREF, epDebatePrepPsychologySectionHref } from "@/lib/election-plan/debate-prep-links";
import {
  getAllDebatePsychologyManualSectionIds,
  getDebatePsychologyManualSection,
  listDebatePsychologyManualSections,
} from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllDebatePsychologyManualSectionIds().map((sectionId) => ({ sectionId }));
}

export async function generateMetadata({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const section = getDebatePsychologyManualSection(sectionId);
  if (!section) return { title: "Section not found" };
  return { title: `${section.title} | Psychology Manual`, robots: { index: false, follow: false } };
}

export default async function ElectionPlanPsychologyManualSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getDebatePsychologyManualSection(sectionId);
  if (!section) notFound();

  const sections = listDebatePsychologyManualSections();
  const idx = sections.findIndex((s) => s.sectionId === sectionId);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx >= 0 && idx < sections.length - 1 ? sections[idx + 1] : null;

  return (
    <>
      <div className="ep-classification">
        Internal · Psychology · Part {section.partNumber}
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8">
            <Link href={EP_DEBATE_PREP_PSYCHOLOGY_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] underline">
              ← Psychology manual
            </Link>
            <p className="mt-3 text-xs font-bold uppercase text-violet-900">{section.eyebrow}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{section.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{section.whyItMattersForKelly}</p>
          </header>
          <ElectionPlanPsychologyManualSectionPanel sectionId={sectionId} />
          <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
            {prev ? (
              <Link href={epDebatePrepPsychologySectionHref(prev.sectionId)} className="text-[var(--ep-navy)] underline">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={epDebatePrepPsychologySectionHref(next.sectionId)} className="text-[var(--ep-navy)] underline">
                {next.title} →
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}
