import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Track = { id: string; label: string; percent: number };

type StatusFile = {
  version: number;
  updatedAt: string;
  tracks: Track[];
  notes?: string[];
};

type KellyAgentCapability = {
  id: string;
  name: string;
  addedAt: string;
  category: string;
  description: string;
  inputSources: string[];
  outputUsedBy: string[];
  humanOverrideRequired: boolean;
  status: "file_staged" | "db_backed" | "live" | "blocked";
};

type AgentToolSuiteReport = {
  generatedAt: string;
  overallStatus: "green" | "yellow" | "red";
  capabilities: Array<{ id: string; status: string }>;
  dashboardReadiness: { blockers: string[]; warnings: string[] };
  missingData: Array<{ severity: string; area: string; item: string }>;
  nextRecommendedBuilds: Array<{ priority: number; title: string; reason: string; expectedImpact: string }>;
};

function loadJson<T>(relative: string): T | null {
  const p = path.join(process.cwd(), relative);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function loadStatus(): StatusFile | null {
  return loadJson<StatusFile>("data/calendar-command-center/calendar-v2-build-status.json");
}

function loadV3Status(): StatusFile | null {
  return loadJson<StatusFile>("data/calendar-command-center/calendar-v3-build-status.json");
}

function loadCapabilities(): KellyAgentCapability[] {
  const raw = loadJson<{ capabilities?: KellyAgentCapability[] } | KellyAgentCapability[]>(
    "data/agent/kelly-agent-capabilities.json",
  );
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.capabilities ?? [];
}

function loadAgentToolSuite(): AgentToolSuiteReport | null {
  return loadJson<AgentToolSuiteReport>("data/agent/kelly-agent-tool-suite-latest.json");
}

export default function CalendarV2BuildStatusPage() {
  const data = loadStatus();
  const v3 = loadV3Status();
  const capabilities = loadCapabilities();
  const suite = loadAgentToolSuite();
  const suiteCounts = suite
    ? {
        total: suite.capabilities.length,
        live: suite.capabilities.filter((c) => c.status === "live").length,
        dbBacked: suite.capabilities.filter((c) => c.status === "db_backed").length,
        fileStaged: suite.capabilities.filter((c) => c.status === "file_staged").length,
        blocked: suite.capabilities.filter((c) => c.status === "blocked").length,
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Build status · V2 + V3</span>
        {" · "}
        <Link href="/admin/calendar-command-center/google-setup" className="text-kelly-text underline-offset-2 hover:underline">
          Google setup
        </Link>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Progress</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Kelly calendar + agent slice</h1>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          V2 JSON tracks the original calendar slice. V3 JSON tracks intelligence + election math. Capabilities ledger lists every Kelly-agent lane; each future pass should append one entry.
        </p>
      </header>

      <section className="rounded-xl border border-kelly-navy/15 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kelly Agent Tool Suite</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-kelly-text">
              {suite ? suite.overallStatus.toUpperCase() : "Not run yet"}
            </h2>
            <p className="mt-1 font-body text-xs text-kelly-muted">
              {suite ? `Last run ${suite.generatedAt}` : "Run npm run agent:tool-suite to generate the self-audit report."}
            </p>
          </div>
          {suiteCounts ? (
            <div className="grid grid-cols-2 gap-2 text-right font-body text-[11px] text-kelly-muted sm:grid-cols-5">
              <span><b>{suiteCounts.total}</b><br />total</span>
              <span><b>{suiteCounts.live}</b><br />live</span>
              <span><b>{suiteCounts.dbBacked}</b><br />DB</span>
              <span><b>{suiteCounts.fileStaged}</b><br />staged</span>
              <span><b>{suiteCounts.blocked}</b><br />blocked</span>
            </div>
          ) : null}
        </div>
        {suite ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-3 py-3">
              <p className="font-body text-[10px] font-bold uppercase text-kelly-subtle">Top blockers</p>
              <ul className="mt-2 space-y-1 font-body text-xs text-kelly-text/75">
                {[...suite.dashboardReadiness.blockers, ...suite.dashboardReadiness.warnings].slice(0, 4).map((b) => <li key={b}>• {b}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-3 py-3">
              <p className="font-body text-[10px] font-bold uppercase text-kelly-subtle">Missing data</p>
              <ul className="mt-2 space-y-1 font-body text-xs text-kelly-text/75">
                {suite.missingData.slice(0, 4).map((m) => <li key={`${m.area}-${m.item}`}>• {m.item}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-3 py-3">
              <p className="font-body text-[10px] font-bold uppercase text-kelly-subtle">Next builds</p>
              <ul className="mt-2 space-y-1 font-body text-xs text-kelly-text/75">
                {suite.nextRecommendedBuilds.slice(0, 4).map((b) => <li key={b.priority}>• {b.title}</li>)}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-emerald-900/20 bg-emerald-950/[0.04] px-4 py-4 shadow-sm">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-900/70">Kelly Agent Intelligence Added</p>
        <p className="mt-1 font-body text-xs text-kelly-text/75">
          Source: <code className="rounded bg-white/80 px-1">data/agent/kelly-agent-capabilities.json</code>
        </p>
        {capabilities.length === 0 ? (
          <p className="mt-2 font-body text-sm text-amber-800">Missing capabilities JSON.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {capabilities.map((c) => (
              <li key={c.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-heading text-sm font-bold text-kelly-text">{c.name}</p>
                  <span className="rounded-full bg-kelly-wash px-2 py-0.5 font-body text-[9px] font-bold uppercase text-kelly-muted">
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 font-body text-[11px] text-kelly-muted">{c.description}</p>
                <p className="mt-1 font-body text-[10px] text-kelly-muted">
                  <span className="font-semibold">Category:</span> {c.category}
                  {c.humanOverrideRequired ? (
                    <span className="ml-2 font-semibold text-emerald-900">Human override required</span>
                  ) : null}
                </p>
                <p className="mt-1 font-body text-[10px] text-kelly-muted">
                  <span className="font-semibold">Inputs:</span> {c.inputSources.slice(0, 4).join(" · ")}
                  {c.inputSources.length > 4 ? " …" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!data ? (
        <p className="font-body text-sm text-amber-800">Missing V2 build status JSON.</p>
      ) : (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-kelly-text">Calendar V2 tracks</h2>
          <p className="font-body text-xs text-kelly-muted">Updated {data.updatedAt}</p>
          <ul className="space-y-3">
            {data.tracks.map((t) => (
              <li key={t.id} className="rounded-lg border border-kelly-text/12 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-body text-sm font-semibold text-kelly-text">{t.label}</p>
                  <p className="font-body text-xs text-kelly-muted">{t.percent}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-wash">
                  <div className="h-full rounded-full bg-emerald-700/90" style={{ width: `${Math.min(100, Math.max(0, t.percent))}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {data.notes?.length ? (
            <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-4 py-3 font-body text-xs text-kelly-text/80">
              <ul className="list-inside list-disc space-y-1">
                {data.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {!v3 ? (
        <p className="font-body text-sm text-amber-800">Missing V3 build status JSON.</p>
      ) : (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-kelly-text">V3 intelligence tracks</h2>
          <p className="font-body text-xs text-kelly-muted">Updated {v3.updatedAt}</p>
          <ul className="space-y-3">
            {v3.tracks.map((t) => (
              <li key={t.id} className="rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.03] px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-body text-sm font-semibold text-kelly-text">{t.label}</p>
                  <p className="font-body text-xs text-kelly-muted">{t.percent}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-wash">
                  <div className="h-full rounded-full bg-kelly-navy/80" style={{ width: `${Math.min(100, Math.max(0, t.percent))}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {v3.notes?.length ? (
            <div className="rounded-lg border border-kelly-text/10 bg-white/90 px-4 py-3 font-body text-xs text-kelly-text/80">
              <ul className="list-inside list-disc space-y-1">
                {v3.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
