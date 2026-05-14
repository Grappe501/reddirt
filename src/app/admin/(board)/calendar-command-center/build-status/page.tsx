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

function loadStatus(): StatusFile | null {
  const p = path.join(process.cwd(), "data/calendar-command-center/calendar-v2-build-status.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as StatusFile;
  } catch {
    return null;
  }
}

export default function CalendarV2BuildStatusPage() {
  const data = loadStatus();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="font-body text-xs text-kelly-text/60">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Calendar V2 build status</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">Progress</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Kelly calendar + agent slice</h1>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Static JSON at <code className="rounded bg-white/80 px-1">data/calendar-command-center/calendar-v2-build-status.json</code> — bump
          percentages as slices land. Keep production deploy branch protected; work on feature branches until checks pass.
        </p>
      </header>

      {!data ? (
        <p className="font-body text-sm text-amber-800">Missing build status JSON.</p>
      ) : (
        <div className="space-y-4">
          <p className="font-body text-xs text-kelly-text/60">Updated {data.updatedAt}</p>
          <ul className="space-y-3">
            {data.tracks.map((t) => (
              <li key={t.id} className="rounded-lg border border-kelly-text/12 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-body text-sm font-semibold text-kelly-text">{t.label}</p>
                  <p className="font-body text-xs text-kelly-text/60">{t.percent}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-wash">
                  <div className="h-full rounded-full bg-emerald-700/90" style={{ width: `${Math.min(100, Math.max(0, t.percent))}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {data.notes?.length ? (
            <section className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-4 py-3 font-body text-xs text-kelly-text/80">
              <ul className="list-inside list-disc space-y-1">
                {data.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
