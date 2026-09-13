import Link from "next/link";
import type { SeoDesk } from "@/lib/analytics/site-traffic-aggregate";

function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function SiteAnalyticsSeoDesk({ seo, sessions }: { seo: SeoDesk; sessions: number }) {
  return (
    <section className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Search / SEO</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">What search is doing</h2>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-slate">
        Search engines send a host (google.com, bing.com). They do not send the words people typed. We read landings,
        bounce, and the next click — that is the SEO signal we actually have.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <SeoStat label="Search sessions" value={String(seo.sessions)} hint={seo.share == null ? "0% of visits" : `${Math.round(seo.share * 100)}% of visits`} />
        <SeoStat label="Held past page one" value={formatPct(seo.engageRate)} hint={`${sessions} total sessions`} />
        <SeoStat label="Search bounce" value={formatPct(seo.bounceRate)} hint="Left after the landing page" />
        <SeoStat
          label="Engines"
          value={seo.engines[0]?.label ?? "None yet"}
          hint={seo.engines.slice(1).map((row) => `${row.label} ${row.hits}`).join(" · ") || "Waiting on google.com / bing.com referrers"}
        />
      </div>

      <ul className="mt-5 space-y-2 font-body text-sm leading-relaxed text-kelly-ink">
        {seo.reads.map((row) => (
          <li key={row} className="rounded-lg bg-kelly-fog/60 px-4 py-3">
            {row}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-heading text-lg font-bold text-kelly-ink">SEO landings</h3>
          {seo.landings.length === 0 ? (
            <p className="mt-2 font-body text-sm text-kelly-slate">No search landings in this window.</p>
          ) : (
            <ol className="mt-3 space-y-2 font-body text-sm">
              {seo.landings.map((row) => (
                <li key={row.path} className="flex justify-between gap-3">
                  <Link href={row.path} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy hover:underline">
                    {row.path}
                  </Link>
                  <span className="shrink-0 text-kelly-slate">{row.hits} sessions</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-kelly-ink">After they arrived from search</h3>
          {seo.nextPages.length === 0 ? (
            <p className="mt-2 font-body text-sm text-kelly-slate">
              Search visitors are not taking a second step. The landing page is the whole SEO visit.
            </p>
          ) : (
            <ol className="mt-3 space-y-2 font-body text-sm">
              {seo.nextPages.map((row) => (
                <li key={`${row.from}-${row.to}`} className="text-kelly-ink">
                  <span className="font-semibold text-kelly-navy">{row.from}</span>
                  <span className="text-kelly-slate"> → </span>
                  <span className="font-semibold text-kelly-navy">{row.to}</span>
                  <span className="ml-2 text-kelly-slate">{row.hits}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function SeoStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-kelly-ink/10 bg-kelly-fog/40 px-4 py-3">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-kelly-ink">{value}</p>
      <p className="mt-1 font-body text-xs text-kelly-slate">{hint}</p>
    </div>
  );
}
