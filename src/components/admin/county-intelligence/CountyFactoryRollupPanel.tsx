import Link from "next/link";
import { buildCountyFactoryDashboardRollup } from "@/lib/county-workbench/factory/aiCountyBuilderAgent";
import { loadProfileRollup, type CountyProfileRollupFile } from "@/lib/county-workbench/factory/countyProfileCompiler";
import { loadBriefRollup, type CountyBriefRollupFile } from "@/lib/county-workbench/factory/countyBriefFactory";

export function CountyFactoryRollupPanel() {
  const rollup = buildCountyFactoryDashboardRollup();
  const profileRollup: CountyProfileRollupFile | null = loadProfileRollup();
  const briefRollup: CountyBriefRollupFile | null = loadBriefRollup();
  const sampleRows = profileRollup?.countyIndex?.slice(0, 8) ?? [];

  return (
    <section className="rounded-2xl border-2 border-teal-800/20 bg-teal-50/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">County Workbench Factory</p>
          <h2 className="font-heading text-xl font-bold text-kelly-navy">All 75 counties — factory rollup</h2>
          <p className="mt-1 text-xs font-semibold text-amber-900">{rollup.governance.labels.join(" · ")}</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-2 text-center">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Avg readiness</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{rollup.profiles.avgReadiness}/100</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total facts", rollup.facts.totalFacts],
          ["Counties w/ facts", `${rollup.facts.countiesRepresented}/75`],
          ["Profiles", `${rollup.profiles.countyCount}/75`],
          ["Briefs", `${rollup.briefs.countyCount}/75`],
          ["Shell profiles", rollup.profiles.byStatus.SHELL],
          ["Configured sources", rollup.sources.configuredSources],
          ["Deferred sources", rollup.sources.deferredSources],
          ["Shell briefs", rollup.briefs.shellBriefCount],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border bg-white p-3 text-xs">
            <div className="text-kelly-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-kelly-navy">{value}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-4 text-xs font-bold uppercase text-kelly-navy">Next global data pulls</h3>
      <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
        {rollup.agentRecommendations.map((r) => (
          <li key={r.slice(0, 40)}>{r}</li>
        ))}
      </ul>

      <h3 className="mt-4 text-xs font-bold uppercase text-kelly-navy">County factory status (sample)</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b text-kelly-muted">
              <th className="py-1 pr-2">County</th>
              <th className="py-1 pr-2">Profile</th>
              <th className="py-1 pr-2">Brief</th>
              <th className="py-1">Score</th>
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row) => {
              const briefRow = briefRollup?.countyIndex?.find((b) => b.countySlug === row.countySlug);
              return (
                <tr key={row.countySlug} className="border-b border-kelly-text/5">
                  <td className="py-1 pr-2">
                    <Link
                      href={`/admin/counties/${row.countySlug.replace(/-county$/, "")}`}
                      className="underline text-kelly-navy"
                    >
                      {row.countyName}
                    </Link>
                  </td>
                  <td className="py-1 pr-2">{row.status}</td>
                  <td className="py-1 pr-2">{briefRow?.briefGenerated ? "generated" : "—"}</td>
                  <td className="py-1">{row.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-kelly-muted">
        Run <code>npm run county:factory:all</code> to refresh all counties together. Per-county JSON stays off the
        serverless bundle; rollups only at runtime.
      </p>
    </section>
  );
}
