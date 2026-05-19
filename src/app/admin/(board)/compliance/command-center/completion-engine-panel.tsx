import Link from "next/link";
import { ComplianceCard, ComplianceMetricCard } from "../components";
import { loadCompletionEngineSummary } from "@/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

export async function ComplianceCompletionEnginePanel() {
  const engine = await loadCompletionEngineSummary();

  return (
    <ComplianceCard title="Completion Engine" href="/admin/compliance/command-center">
      <p className="mb-4 text-base font-semibold text-[#0f2744]">{engine.nextBestAction.plainEnglish}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Completion" value={`${engine.overallPercentComplete}%`} tone={engine.overallPercentComplete >= 70 ? "yellow" : "red"} />
        <ComplianceMetricCard label="Filing" value={engine.filingStatus} tone={engine.filingStatus === "green" ? "green" : "red"} />
        <ComplianceMetricCard label="Weaknesses (crit+high)" value={String(engine.weaknessSummary.critical + engine.weaknessSummary.high)} tone="yellow" />
        <ComplianceMetricCard label="Hardening" value={engine.hardeningStatus} tone={engine.hardeningStatus === "pass" ? "green" : "yellow"} />
      </div>

      <div className="mt-4 rounded-xl border border-[#0f2744] bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Do this next</p>
        <p className="mt-1 text-lg font-bold text-[#0f2744]">{engine.nextBestAction.title}</p>
        <p className="mt-1 text-sm">
          Owner: <span className="font-semibold">{engine.nextBestAction.owner}</span> · Top blocker: {engine.topBlocker.label}
        </p>
        {engine.nextBestAction.href ? (
          <Link href={engine.nextBestAction.href} className="mt-2 inline-block text-sm font-bold text-[#0f2744] underline">
            Open →
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/compliance/april26" className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-[#0f2744]">
          April audit checklist
        </Link>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-950">Audit MD in docs/compliance</span>
        <Link href="/admin/compliance/vendors" className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-[#0f2744]">
          Vendors / addresses
        </Link>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Regenerate: <code className="rounded bg-slate-100 px-1">npm run compliance:ai-completion-engine</code>
      </p>
    </ComplianceCard>
  );
}
