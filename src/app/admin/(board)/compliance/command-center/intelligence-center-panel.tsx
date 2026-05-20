import Link from "next/link";
import { ComplianceCard, ComplianceMetricCard, ComplianceWarningPanel } from "../components";
import { buildIntelligencePackage } from "@/lib/compliance/ai/intelligence/build-intelligence-package";

export async function ComplianceIntelligenceCenterPanel() {
  const pkg = await buildIntelligencePackage();
  const s = pkg.snapshot;
  const top5 = pkg.criticalPathV2.actions.slice(0, 5);
  const next = top5[0];
  const ernieTasks = pkg.workRouter.queues.ernie ?? [];
  const treasurerTasks = pkg.workRouter.queues.treasurer ?? [];
  const exceptionTotal = pkg.exceptionResolver.groups.reduce((n, g) => n + g.count, 0);

  return (
    <ComplianceCard title="AI Intelligence Center">
      <p className="text-sm text-slate-600">
        Operating intelligence — diagnoses, routes, forecasts. Commit {s.commitBase}. Regenerate:{" "}
        <code className="rounded bg-slate-100 px-1">npm run compliance:ai-intelligence</code>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Filing forecast" value={pkg.filingPredictor.currentStatus} tone={s.filingStatus === "green" ? "green" : s.filingStatus === "yellow" ? "yellow" : "red"} />
        <ComplianceMetricCard label="Data quality" value={`${pkg.dataQuality.overallScore}/100`} tone={pkg.dataQuality.overallScore >= 70 ? "yellow" : "red"} />
        <ComplianceMetricCard label="Exception groups" value={exceptionTotal} tone={exceptionTotal > 20 ? "red" : "yellow"} />
        <ComplianceMetricCard label="Audit rows" value={s.auditSpreadsheet.mainRows} tone={s.auditSpreadsheet.present ? "green" : "red"} />
      </div>

      <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold text-[#0f2744]">Current diagnosis</h3>
        <p className="mt-2 text-sm">{pkg.diagnosis.summary}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {pkg.diagnosis.items.slice(0, 3).map((i) => (
            <li key={i.id}>{i.question}</li>
          ))}
        </ul>
      </section>

      {next ? (
        <section className="mt-4 rounded-xl border-2 border-[#0f2744] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Next best global action</p>
          <p className="mt-1 font-heading text-lg font-bold text-[#0f2744]">{next.title}</p>
          <p className="mt-1 text-sm text-slate-600">{next.filingReadinessGain}</p>
          {next.href ? (
            <Link href={next.href} className="mt-3 inline-block text-sm font-bold text-[#0f2744] underline">
              Open workflow
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4">
        <h3 className="text-sm font-bold text-[#0f2744]">Critical path (top 5)</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          {top5.map((a) => (
            <li key={a.id}>
              <span className="font-semibold">{a.title}</span>
              <span className="text-slate-500"> — {a.owner}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RoleWorkCard title="Ernie" tasks={ernieTasks} href="/admin/compliance/ernie" />
        <RoleWorkCard title="Treasurer" tasks={treasurerTasks} href="/admin/compliance/reconciliation" />
      </div>

      <section className="mt-4">
        <h3 className="text-sm font-bold text-[#0f2744]">Memory / delta</h3>
        <p className="mt-1 text-sm text-slate-600">
          Previous commit: {pkg.memory.previousCommit ?? "first run"} · Carry forward: {pkg.memory.carryForward.slice(0, 2).join("; ")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {pkg.memory.deltas.slice(0, 4).map((d) => (
            <li key={d.metric} className="rounded-full border border-slate-200 bg-white px-2 py-1">
              {d.metric}: {d.before ?? "—"} → {d.after}
            </li>
          ))}
        </ul>
      </section>

      <ComplianceWarningPanel title="Unsafe shortcuts — never" tone="red">
        <ul className="list-disc pl-5 text-sm">
          {s.unsafeShortcuts.slice(0, 6).map((u) => (
            <li key={u}>{u.replace(/_/g, " ")}</li>
          ))}
        </ul>
      </ComplianceWarningPanel>

      <p className="mt-3 text-xs text-slate-500">
        Docs: COMPLIANCE_AI_INTELLIGENCE_BRIEF.md · COMPLIANCE_AI_DIAGNOSIS_REPORT.md · JSON in data/compliance/ai/ (gitignored)
      </p>
    </ComplianceCard>
  );
}

function RoleWorkCard({
  title,
  tasks,
  href,
}: {
  title: string;
  tasks: { title: string; route: string; doneCondition: string }[];
  href: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-[#0f2744]">{title}</h4>
        <Link href={href} className="text-xs font-bold underline">
          Open
        </Link>
      </div>
      <ul className="mt-2 space-y-2 text-sm">
        {tasks.length === 0 ? (
          <li className="text-slate-500">No routed tasks — run intelligence refresh.</li>
        ) : (
          tasks.slice(0, 3).map((t) => (
            <li key={t.title} className="rounded-lg border border-slate-100 p-2">
              <p className="font-semibold">{t.title}</p>
              <p className="text-xs text-slate-500">Done: {t.doneCondition}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
