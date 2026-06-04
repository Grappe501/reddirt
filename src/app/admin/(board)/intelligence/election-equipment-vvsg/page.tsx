import { V4ElectionFundingIntelligencePanel } from "@/components/admin/intelligence/v4/V4ElectionFundingIntelligencePanel";
import { V4Vvsg20CandidateEducationPanel } from "@/components/admin/intelligence/v4/V4Vvsg20CandidateEducationPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { loadVvsg20CandidateEducation } from "@/lib/intelligence/v4/vvsg20CandidateEducation";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** EAC VVSG 2.0 deployment report — candidate education for debate and trail. */
export default function Vvsg20EducationPage() {
  const src = loadVvsg20CandidateEducation().governance.sourceDocument;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Election equipment · federal standards"
        title="VVSG 2.0 — what Kelly should know and present"
        description="Ingested from the May 2026 EAC report on next-generation certified voting systems: certification timelines, aging inventory, national costs, Arkansas SOS role, and debate-ready framing."
        guide={getSurfaceGuide("countyClerkWeek")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/election-funding"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          CVSGF funding
        </Link>
        <a
          href={src.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-indigo-300/60 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          EAC source PDF
        </a>
      </V4PageHeader>

      <V4Vvsg20CandidateEducationPanel />
    </div>
  );
}
