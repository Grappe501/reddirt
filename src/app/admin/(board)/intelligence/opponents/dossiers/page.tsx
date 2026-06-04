import { V4OpponentDossiersHub } from "@/components/admin/intelligence/v4/V4OpponentDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";

export default function OpponentDossiersHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Opposition intelligence"
        title="Opponent candidate dossiers"
        description="Complete profiles for Kim Hammer and Dr. Michael Pakko — strengths, weaknesses, verified claims, lead stories to watch, and narrative drill-down for debate and ACCA panel prep."
      >
        <V4BackLinks />
      </V4PageHeader>
      <V4OpponentDossiersHub />
    </div>
  );
}
