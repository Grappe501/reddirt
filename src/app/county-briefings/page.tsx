import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "County briefings | Kelly Grappe for Arkansas Secretary of State",
  description:
    "Planning briefings by county — aggregate public data only. Links to the county coordination hub and staff candidate briefs.",
};

const BRIEFINGS: {
  href: string;
  name: string;
  blurb: string;
  status: "live" | "planned";
}[] = [
  {
    href: "/county-briefings/pope",
    name: "Pope County",
    blurb: "Pilot political profile and briefing illustration — aggregate public data only.",
    status: "live",
  },
  {
    href: "/county-briefings/pope/v2",
    name: "Pope County — briefing dashboard v2 (sample)",
    blurb: "Visual-first county intelligence template with clearly labeled demo scaffolding where live feeds are not yet wired.",
    status: "live",
  },
  {
    href: "/county-briefings/pulaski/v2",
    name: "Pulaski County — briefing dashboard v2",
    blurb:
      "Central Arkansas shell matching the Pope template: engine-backed aggregates only; city drilldown deferred with an explicit ‘data needed’ stance—no fabricated place or precinct KPIs.",
    status: "live",
  },
  {
    href: "/county-briefings/faulkner/v2",
    name: "Faulkner County — briefing dashboard v2",
    blurb:
      "Central Arkansas corridor shell matching the Pope template: aggregates from the county profile engine where present; Conway (city)—not Conway County—precinct drilldown scaffolded honestly until ingest.",
    status: "live",
  },
];

export default function CountyBriefingsHubPage() {
  const wb = siteConfig.countyWorkbenchUrl;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-kelly-text">
      <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Kelly Grappe for Secretary of State</p>
      <h1 className="font-heading mt-2 text-3xl font-bold">County planning briefings</h1>
      <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
        These pages use <strong>verified public election results and planning math</strong> at the aggregate level only — never
        individual voter data. We are rolling briefings out county by county through 2025–26.
      </p>

      {wb ? (
        <p className="mt-4 rounded-md border border-kelly-text/10 bg-kelly-page/80 px-4 py-3 text-sm text-kelly-text/85">
          <strong>County coordination hub (sister site):</strong>{" "}
          <a href={wb} className="font-semibold text-kelly-slate underline" target="_blank" rel="noopener noreferrer">
            Open the county workbench
          </a>{" "}
          for Pope-first dashboards, registration goals, and drill-downs built for county teams. This campaign site stays the SOS
          narrative; the workbench is the place for the fuller county portal experience.
        </p>
      ) : (
        <p className="mt-4 rounded-md border border-amber-200/70 bg-amber-50/80 px-4 py-2 text-sm text-amber-950">
          <strong>County workbench URL not set.</strong> Add{" "}
          <code className="rounded bg-kelly-text/5 px-1">NEXT_PUBLIC_COUNTY_WORKBENCH_URL</code> in deploy env to show a live link to
          the sister county portal.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Briefings on this site</h2>
        <ul className="mt-3 space-y-3">
          {BRIEFINGS.map((b) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className="block rounded-card border border-kelly-text/10 bg-kelly-page p-4 shadow-sm transition hover:border-kelly-slate/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-base font-bold text-kelly-text">{b.name}</span>
                  <span
                    className={
                      b.status === "live"
                        ? "rounded-full bg-kelly-success/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kelly-success"
                        : "rounded-full bg-kelly-text/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kelly-text/60"
                    }
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-kelly-text/70">{b.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-kelly-text/60">
          <strong>Coming:</strong> additional counties as we publish the same public pattern—starting with central Arkansas and
          expanding region by region.
        </p>
      </section>

      <section className="mt-8 text-sm text-kelly-text/70">
        <h2 className="font-heading text-base font-bold text-kelly-text">Campaign team materials</h2>
        <p className="mt-1">
          Deeper regional one-pagers and research packets for signed-in campaign workspaces are intentionally not listed on this
          public hub.
        </p>
      </section>
    </div>
  );
}
