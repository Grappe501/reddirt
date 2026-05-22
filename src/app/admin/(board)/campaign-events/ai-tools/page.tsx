import Link from "next/link";
import { Suspense } from "react";
import { AiToolsCommandCenter } from "@/components/admin/campaign-events/AiToolsCommandCenter";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";

export const dynamic = "force-dynamic";

export default function CampaignEventAiToolsRoutePage() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operating system · AI command center"
        title="AI Agent Tool Command Center"
        description="Operational tool OS: readiness score, capability matrix, agent runbook, functional vs needs-build vs automation-blocked sections, per-tool detail drawer, and ranked build-next recommendations for April and travel ledger."
        actions={
          <>
            <Link href="/admin/candidate-dashboard" className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              Candidate dashboard
            </Link>
            <Link href="/admin/campaign-manager-dashboard" className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              CM dashboard
            </Link>
            <Link href="/admin/campaign-events/travel-report?month=2026-03" className="rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy">
              Travel report
            </Link>
            <Link href="/admin/campaign-events/workbench" className="rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy">
              Workbench
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <Suspense fallback={<p className="font-body text-sm text-kelly-muted">Loading AI tool command center…</p>}>
        <AiToolsCommandCenter />
      </Suspense>
    </div>
  );
}
