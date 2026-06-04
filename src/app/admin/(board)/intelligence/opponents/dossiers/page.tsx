import { V4AllCandidateDossiersHub } from "@/components/admin/intelligence/v4/V4KellyCandidateDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OpponentDossiersHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Candidate dossiers"
        title="All SOS candidate dossiers"
        description="Kelly's Experience-to-Office Alignment Profile plus complete opponent profiles for Kim Hammer and Dr. Michael Pakko — single-page readouts with drill-down narrative sections for debate and ACCA panel prep."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/candidate-dossiers/kelly-grappe"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Kelly alignment profile →
        </Link>
      </V4PageHeader>
      <V4AllCandidateDossiersHub />
    </div>
  );
}
