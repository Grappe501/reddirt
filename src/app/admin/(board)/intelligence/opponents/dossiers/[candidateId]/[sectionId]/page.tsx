import { V4OpponentDossierSectionPanel } from "@/components/admin/intelligence/v4/V4OpponentDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  getOpponentDossierSection,
  getAllOpponentDossierSectionIds,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllOpponentDossierSectionIds().map((sectionId) => {
    const s = getOpponentDossierSection(sectionId)!;
    return { candidateId: s.candidateId, sectionId };
  });
}

export default async function OpponentDossierSectionPage({
  params,
}: {
  params: Promise<{ candidateId: string; sectionId: string }>;
}) {
  const { candidateId, sectionId } = await params;
  const section = getOpponentDossierSection(sectionId);
  if (!section || section.candidateId !== candidateId) notFound();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`${candidateId === "kim-hammer" ? "Hammer" : "Pakko"} dossier · ${section.eyebrow}`}
        title={section.title}
        description={section.whyItMattersForKelly}
      >
        <V4BackLinks />
        <Link
          href={`/admin/intelligence/opponents/dossiers/${candidateId}`}
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Full dossier
        </Link>
      </V4PageHeader>
      <V4OpponentDossierSectionPanel sectionId={sectionId} />
    </div>
  );
}
