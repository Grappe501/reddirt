import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import {
  fairStubAddTentative,
  fairStubMarkVerified,
  fairStubNeedsCall,
  fairStubSendLocal,
} from "@/app/admin/calendar-command-center/fairs-actions";
import { arkansasCountyFairsDataPresent, loadArkansasCountyFairsNormalized } from "@/lib/fairs/load-arkansas-county-fairs-data";

export const dynamic = "force-dynamic";

function auditExcerpt(repoRoot: string): string | null {
  const p = path.join(repoRoot, "docs", "calendar-command-center", "ARKANSAS_COUNTY_FAIR_AUDIT.md");
  if (!existsSync(p)) return null;
  const t = readFileSync(p, "utf8");
  return t.split("\n").slice(0, 25).join("\n");
}

export default function ArkansasCountyFairsPage() {
  const rows = loadArkansasCountyFairsNormalized();
  const has = arkansasCountyFairsDataPresent();
  const excerpt = auditExcerpt(process.cwd());

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <span className="text-kelly-text/80">County fair map (staff)</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Arkansas county fairs 2026</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Statewide fair audit + routing</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          Data from <code className="rounded bg-white/80 px-1">npm run fairs:arkansas:scrape</code>,{" "}
          <code className="rounded bg-white/80 px-1">normalize</code>, <code className="rounded bg-white/80 px-1">plan</code>. No Prisma writes.
          Kelly approval queue is not bulk-loaded here — filter in ops workflow.
        </p>
      </header>

      {!has ? (
        <div className="rounded-lg border border-amber-600/40 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          <p className="font-semibold">No normalized fair file yet.</p>
          <p className="mt-1">
            From the RedDirt folder run{" "}
            <code className="rounded bg-amber-100/80 px-1 text-xs">npm run fairs:arkansas:scrape && npm run fairs:arkansas:normalize && npm run fairs:arkansas:plan</code>
          </p>
        </div>
      ) : null}

      {excerpt ? (
        <section className="rounded-lg border border-kelly-text/12 bg-white px-4 py-3 font-mono text-[10px] text-kelly-text/80">
          <p className="mb-2 font-body text-xs font-bold text-kelly-text">Audit excerpt (see full doc in repo)</p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap">{excerpt}</pre>
        </section>
      ) : null}

      {has ? (
        <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white">
          <table className="min-w-full border-collapse font-body text-xs text-kelly-text">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-wash/50 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-2 py-2">County</th>
                <th className="px-2 py-2">Fair</th>
                <th className="px-2 py-2">Dates</th>
                <th className="px-2 py-2">Verified</th>
                <th className="px-2 py-2">Campaign</th>
                <th className="px-2 py-2">Cluster</th>
                <th className="px-2 py-2">Conflicts</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-kelly-text/10 hover:bg-kelly-wash/30">
                  <td className="px-2 py-2 font-semibold">{r.county}</td>
                  <td className="max-w-[200px] px-2 py-2">{r.fairName}</td>
                  <td className="whitespace-nowrap px-2 py-2">
                    {r.startDate ?? "—"}
                    {r.endDate && r.endDate !== r.startDate ? `–${r.endDate}` : ""}
                  </td>
                  <td className="px-2 py-2">{r.verificationStatus}</td>
                  <td className="px-2 py-2">{r.campaignValue}</td>
                  <td className="max-w-[140px] px-2 py-2 text-[10px] leading-tight text-kelly-text/80">{r.routeCluster ?? "—"}</td>
                  <td className="px-2 py-2 text-center">{r.kellyCalendarConflictIds?.length ?? 0}</td>
                  <td className="px-1 py-1">
                    <div className="flex flex-wrap gap-1">
                      <form action={fairStubAddTentative}>
                        <input type="hidden" name="fairId" value={r.id} />
                        <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-1 text-[9px] font-bold uppercase">
                          Tentative
                        </button>
                      </form>
                      <form action={fairStubSendLocal}>
                        <input type="hidden" name="fairId" value={r.id} />
                        <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-1 text-[9px] font-bold uppercase">
                          Send local
                        </button>
                      </form>
                      <form action={fairStubNeedsCall}>
                        <input type="hidden" name="fairId" value={r.id} />
                        <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-1 text-[9px] font-bold uppercase">
                          Needs call
                        </button>
                      </form>
                      <form action={fairStubMarkVerified}>
                        <input type="hidden" name="fairId" value={r.id} />
                        <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-1 text-[9px] font-bold uppercase">
                          Verified
                        </button>
                      </form>
                      {r.sourceUrl ? (
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded border border-emerald-700/30 bg-emerald-50 px-1.5 py-1 text-[9px] font-bold uppercase text-emerald-900"
                        >
                          Source
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
