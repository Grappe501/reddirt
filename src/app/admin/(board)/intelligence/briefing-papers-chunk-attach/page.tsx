import Link from "next/link";
import { Phase11P7UpgradePassPanel } from "@/components/admin/intelligence/Phase11P7UpgradePassPanel";
import { BriefingPapersChunkAttachQueuePanel } from "@/components/admin/intelligence/briefing-papers/BriefingPapersChunkAttachQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildBriefingPapersChunkAttachReport } from "@/lib/intelligence/v4/briefingPapersChunkAttachInventory";
import {
  saveBriefingPapersChunkAttachState,
  stateFromAttachReport,
} from "@/lib/intelligence/v4/briefingPapersChunkAttachState";
import {
  computePhase11P7UpgradePass,
  listBriefingPaperAttachLaneSurfaces,
} from "@/lib/intelligence/v4/phase11P7Closure";

export const dynamic = "force-dynamic";

export default async function BriefingPapersChunkAttachHubPage() {
  const report = await buildBriefingPapersChunkAttachReport();
  saveBriefingPapersChunkAttachState(stateFromAttachReport(report));

  const pass = computePhase11P7UpgradePass();
  const lanes = listBriefingPaperAttachLaneSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · NSI-11 · Phase 11 P7"
        title="Briefing papers chunk attach"
        description="Eight attach lanes wire P6 chunk previews into governed briefing paper deep sections — operator attach workflow, claim-review API gate, and Field Book promotion handoff."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/briefing-papers"
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Briefing papers
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment-chunk-preview"
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Chunk preview (P6)
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p7-upgrade"
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          P7 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P7UpgradePassPanel report={pass} compact />

      <BriefingPapersChunkAttachQueuePanel lanes={lanes} />
    </div>
  );
}
