import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getPrepSectionDrillDown, getAllPrepSectionDrillDownIds } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { V4DebatePrepSectionDrillDownPanel } from "@/components/admin/intelligence/v4/V4DebatePrepSectionDrillDownPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return getAllPrepSectionDrillDownIds().map((sectionId) => ({ sectionId }));
}

type PageProps = { params: Promise<{ sectionId: string }> };

export default async function DebatePrepSectionDrillDownPage({ params }: PageProps) {
  const { sectionId } = await params;
  const drill = getPrepSectionDrillDown(sectionId);
  if (!drill) notFound();

  const v4 = loadDebateIntelligenceV4Packet();
  const section = v4.debatePrepSectionsV4.find((s) => s.id === sectionId);
  const idx = v4.debatePrepSectionsV4.findIndex((s) => s.id === sectionId);
  const prev = idx > 0 ? v4.debatePrepSectionsV4[idx - 1] : null;
  const next = idx >= 0 && idx < v4.debatePrepSectionsV4.length - 1 ? v4.debatePrepSectionsV4[idx + 1] : null;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Debate prep · section ${drill.sectionNumber} of 28`}
        title={drill.sectionTitle}
        description="Full drill-down: how to use this material, what Hammer will do, moderator angles, setup traps, rebuttals, sample scripts, and zingers. Built for a first-time debater against a 25+ year legislator — rehearse standing, out loud."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          ← Full prep packet
        </Link>
      </V4PageHeader>

      <nav className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        {prev ? (
          <Link href={`/admin/intelligence/kim-hammer/debate-prep/${prev.id}`} className="text-kelly-navy underline">
            ← {prev.title.replace(/^\d+\)\s*/, "")}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/admin/intelligence/kim-hammer/debate-prep/${next.id}`} className="text-kelly-navy underline">
            {next.title.replace(/^\d+\)\s*/, "")} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <V4DebatePrepSectionDrillDownPanel drill={drill} section={section} />
    </div>
  );
}
