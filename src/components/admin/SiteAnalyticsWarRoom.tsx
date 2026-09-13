import type { HeatCell, Hypothesis, LandingGrade, PathCluster } from "@/lib/analytics/site-traffic-depth";
import type { DeviceSourceRow, TrafficPulse } from "@/lib/analytics/site-traffic-depth";
import { CHANNEL_LABELS, type TrafficChannelId } from "@/lib/analytics/traffic-source";

const CHANNELS = Object.keys(CHANNEL_LABELS) as TrafficChannelId[];

function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

const gradeColor: Record<LandingGrade["grade"], string> = {
  A: "bg-emerald-700 text-white",
  B: "bg-kelly-navy text-white",
  C: "bg-kelly-gold text-kelly-navy",
  D: "bg-amber-700 text-white",
  F: "bg-red-800 text-white",
};

export function SiteAnalyticsWarRoom({
  hypotheses,
  grades,
  clusters,
  heat,
  deviceSource,
  pulse,
  medianMinutes,
}: {
  hypotheses: Hypothesis[];
  grades: LandingGrade[];
  clusters: PathCluster[];
  heat: HeatCell[];
  deviceSource: DeviceSourceRow[];
  pulse: TrafficPulse;
  medianMinutes: number;
}) {
  const maxHeat = Math.max(1, ...heat.map((row) => row.sessions));

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <PulseCard label="Last 15 minutes" value={String(pulse.last15)} hint={`${pulse.last15Deep} already three pages deep`} />
        <PulseCard label="Last 60 minutes" value={String(pulse.last60)} hint={`${pulse.last60Converted} finished a form`} />
        <PulseCard
          label="Median visit"
          value={medianMinutes <= 0 ? "one page" : medianMinutes < 1 ? `${Math.max(1, Math.round(medianMinutes * 60))}s` : `${medianMinutes.toFixed(1)}m`}
          hint="Half of visits are shorter than this"
        />
        <PulseCard label="Live check" value={pulse.last15 > 0 ? "Hot" : pulse.last60 > 0 ? "Warm" : "Quiet"} hint="If people are on the site and this stays Quiet, recording is still off" />
      </div>

      <div className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Always-on intelligence</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">What the data is arguing</h2>
        <p className="mt-2 font-body text-sm text-kelly-slate">
          These claims are computed from journeys, not from OpenAI. Run a lens above when you want a written brief.
        </p>
        <ol className="mt-4 space-y-4">
          {hypotheses.map((row) => (
            <li key={row.claim} className="rounded-xl border border-kelly-ink/10 bg-kelly-fog/40 px-4 py-3">
              <p className="font-heading text-base font-bold text-kelly-ink">{row.claim}</p>
              <p className="mt-1 font-body text-sm text-kelly-slate">{row.because}</p>
              <p className="mt-2 font-body text-sm text-kelly-navy">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-kelly-slate">{row.confidence} confidence · </span>
                {row.doNext}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-kelly-ink">Landing grades</h3>
          <p className="mt-1 font-body text-sm text-kelly-slate">Each front door scored by bounce, next click, and conversion.</p>
          {grades.length === 0 ? (
            <p className="mt-3 font-body text-sm text-kelly-slate">No landings to grade yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {grades.map((row) => (
                <li key={row.path} className="flex gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-lg font-bold ${gradeColor[row.grade]}`}>
                    {row.grade}
                  </span>
                  <div>
                    <p className="font-body text-sm font-semibold text-kelly-navy">{row.path}</p>
                    <p className="font-body text-xs text-kelly-slate">
                      {row.sessions} landings · bounce {formatPct(row.bounceRate)}
                      {row.next ? ` · next ${row.next}` : ""}
                      {row.converted ? ` · ${row.converted} converted` : ""}
                    </p>
                    <p className="mt-1 font-body text-sm text-kelly-ink">{row.why}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-kelly-ink">Repeated tours</h3>
          <p className="mt-1 font-body text-sm text-kelly-slate">Multi-page openings that keep happening.</p>
          {clusters.length === 0 ? (
            <p className="mt-3 font-body text-sm text-kelly-slate">No repeated multi-page tours yet.</p>
          ) : (
            <ol className="mt-4 space-y-3 font-body text-sm">
              {clusters.map((row) => (
                <li key={row.pattern}>
                  <p className="font-semibold text-kelly-navy">{row.pattern}</p>
                  <p className="text-kelly-slate">
                    {row.sessions} visits · {row.converted} converted · {row.avgMinutes < 1 ? `${Math.max(1, Math.round(row.avgMinutes * 60))}s` : `${row.avgMinutes.toFixed(1)}m`} typical
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-xl font-bold text-kelly-ink">When × source</h3>
        <p className="mt-1 font-body text-sm text-kelly-slate">Arkansas hours across the top. Darker means more visits from that door.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-center font-body text-[10px]">
            <thead>
              <tr>
                <th className="py-1 pr-2 text-left text-kelly-slate"> </th>
                {Array.from({ length: 24 }, (_, hour) => (
                  <th key={hour} className="px-0.5 font-normal text-kelly-slate/70">
                    {hour % 3 === 0 ? hour : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((channel) => (
                <tr key={channel}>
                  <td className="py-1 pr-2 text-left font-semibold text-kelly-ink">{CHANNEL_LABELS[channel]}</td>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = heat.find((row) => row.hour === hour && row.channel === channel);
                    const n = cell?.sessions ?? 0;
                    return (
                      <td key={`${channel}-${hour}`} title={`${CHANNEL_LABELS[channel]} ${hour}:00 — ${n}`}>
                        <div
                          className="mx-auto h-4 w-3 rounded-sm"
                          style={{ backgroundColor: n ? `rgba(11, 31, 58, ${0.18 + (n / maxHeat) * 0.82})` : "rgba(15,23,42,0.06)" }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deviceSource.length ? (
          <div className="mt-5">
            <h4 className="font-heading text-sm font-bold text-kelly-ink">Device × source</h4>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 font-body text-sm">
              {deviceSource.slice(0, 8).map((row) => (
                <li key={`${row.device}-${row.source}`} className="flex justify-between gap-3">
                  <span>
                    {row.device} · {row.source}
                  </span>
                  <span className="text-kelly-slate">
                    {row.sessions} · bounce {formatPct(row.bounceRate)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PulseCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card border border-kelly-ink/10 bg-white px-4 py-3 shadow-sm">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-ink">{value}</p>
      <p className="mt-1 font-body text-xs text-kelly-slate">{hint}</p>
    </div>
  );
}
