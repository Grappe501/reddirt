import Link from "next/link";
import { ComplianceCard } from "../components";
import { buildOrchestratorPackage } from "@/lib/compliance/ai/orchestrator/build-orchestrator";

export async function ComplianceAiOrchestratorPanel() {
  const pkg = await buildOrchestratorPackage();
  const nba = pkg.snapshot.nextBestAction;

  return (
    <ComplianceCard title="AI Orchestrator">
      <p className="text-sm text-slate-600">{pkg.snapshot.programSummary}</p>

      <div className="mt-4 rounded-xl border-2 border-[#0f2744] bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Next best action</p>
        <p className="mt-1 text-lg font-bold text-[#0f2744]">{nba.action.title}</p>
        <p className="mt-1 text-sm">
          Owner: <span className="font-semibold">{nba.action.owner}</span> · Impact: {nba.action.estimatedImpact.summary}
        </p>
        <p className="mt-2 text-sm text-slate-700">{nba.action.whyItMatters}</p>
        <p className="mt-1 text-xs text-slate-500">{nba.rationale}</p>
        {nba.action.href ? (
          <Link href={nba.action.href} className="mt-3 inline-block text-sm font-bold text-[#0f2744] underline">
            Start →
          </Link>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-slate-500">Today&apos;s work plan</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {pkg.snapshot.todayWorkPlan.map((t) => (
            <li key={t.order}>
              [{t.owner}] {t.title}
              {t.href ? (
                <>
                  {" "}
                  <Link href={t.href} className="underline">
                    open
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm">
          <p className="font-bold text-red-900">Unsafe shortcuts</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-red-900/90">
            {pkg.snapshot.unsafeShortcuts.slice(0, 6).map((u) => (
              <li key={u}>{u.replace(/_/g, " ")}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <p className="font-bold text-[#0f2744]">Since last pass</p>
          {pkg.snapshot.changesSinceLastPass.length ? (
            <ul className="mt-1 list-disc pl-4 text-xs">
              {pkg.snapshot.changesSinceLastPass.slice(0, 5).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-slate-600">No prior orchestrator snapshot.</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Guard: {pkg.decisionGuard.allGuardsPassed ? "pass" : "blocked"} · Prod bank verified:{" "}
            {pkg.decisionGuard.productionBankAssumption.verified ? "yes" : "no"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Regenerate: <code className="text-[10px]">npm run compliance:ai-orchestrator</code> · Brief: docs/compliance/COMPLIANCE_AI_ORCHESTRATOR_BRIEF.md
      </p>
    </ComplianceCard>
  );
}
