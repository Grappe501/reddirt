import { V4AllCandidateDossiersHub } from "@/components/admin/intelligence/v4/V4KellyCandidateDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";

export default function CandidateDossiersHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · candidate dossiers"
        title="Candidate dossiers — Kelly, Hammer, Pakko"
        description="Single-page readouts for every SOS candidate. Kelly's Experience-to-Office Alignment Profile maps your background to actual Secretary of State duties — with debate framing, crosswalk tables, and drill-down sections. Opponent dossiers cover strengths, claims, and lead stories for contrast prep."
      >
        <V4BackLinks />
      </V4PageHeader>
      <V4AllCandidateDossiersHub />
    </div>
  );
}
