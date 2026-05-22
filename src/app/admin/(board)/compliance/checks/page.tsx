import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { getApril26ChecksStatus } from "@/lib/compliance/checks/april-check-sos-workbook.server";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function ChecksPage() {
  const [checks, status, openAi] = await Promise.all([
    loadStagedMoneyMovements().then((m) => m.filter((movement) => movement.category === "contribution_check")),
    getApril26ChecksStatus(),
    Promise.resolve(isOpenAIConfigured()),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Checks"
        title="April check contributions"
        description="Review physical check photos, extract SOS fields, and mark each contribution before filing."
      />
      <ComplianceNav />

      <Link
        href="/admin/compliance/checks/sos-entry"
        className="block rounded-2xl border-2 border-[#0f2744] bg-gradient-to-br from-[#0f2744] to-[#1a3d66] p-6 text-white shadow-lg transition hover:brightness-105"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Primary workflow</p>
        <p className="mt-2 text-xl font-bold">Open April check workbench →</p>
        <p className="mt-2 text-sm text-white/85">
          {status.donationPhotoCount} donation photo(s) · {status.stats.totalChecks} check row(s) ·{" "}
          {status.stats.extracted} extracted · {status.stats.reviewed} reviewed
        </p>
        {!openAi ? (
          <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
            Set <code className="rounded bg-black/20 px-1">OPENAI_API_KEY</code> in .env.local to enable vision extract.
          </p>
        ) : null}
      </Link>

      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Staged check intake" href="/admin/compliance/checks/new">
          Manual entry for checks not yet in April26 photos.
        </ComplianceCard>
        <ComplianceCard title="Staged review queue" href="/admin/compliance/checks/review">
          {checks.length} staged check contribution(s).
        </ComplianceCard>
        <ComplianceCard title="Bank reconciliation" href="/admin/compliance/reconciliation">
          Match deposits to bank CSV credits.
        </ComplianceCard>
      </section>
    </div>
  );
}
