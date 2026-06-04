import { V4KellyCandidateDossierPanel } from "@/components/admin/intelligence/v4/V4KellyCandidateDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadKellyGrappeCandidateDossier } from "@/lib/intelligence/v4/loadKellyCandidateDossier";

export const dynamic = "force-dynamic";

export default function KellyCandidateDossierPage() {
  const dossier = loadKellyGrappeCandidateDossier();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly Grappe · alignment profile"
        title="Experience-to-Office Alignment Profile"
        description={dossier.executiveSummary.slice(0, 280) + "…"}
      >
        <V4BackLinks />
      </V4PageHeader>
      <V4KellyCandidateDossierPanel />
    </div>
  );
}
