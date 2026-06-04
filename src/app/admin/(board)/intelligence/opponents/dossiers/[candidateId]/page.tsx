import { V4OpponentCandidateDossierPanel } from "@/components/admin/intelligence/v4/V4OpponentDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadCandidateDossier } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ candidateId: "kim-hammer" }, { candidateId: "michael-packo" }];
}

export default async function OpponentCandidateDossierPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  if (candidateId !== "kim-hammer" && candidateId !== "michael-packo") notFound();

  const dossier = loadCandidateDossier(candidateId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Opponent dossier · ${dossier.party}`}
        title={dossier.displayName}
        description={dossier.executiveSummary.slice(0, 220) + "…"}
      >
        <V4BackLinks />
      </V4PageHeader>
      <V4OpponentCandidateDossierPanel candidateId={candidateId} />
    </div>
  );
}
