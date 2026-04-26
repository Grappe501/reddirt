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
    blurb: "Political profile, GOTV illustration, relational organizing — first pilot on this site.",
    status: "live",
  },
];

export default function CountyBriefingsHubPage() {
  const wb = siteConfig.countyWorkbenchUrl;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-deep-soil">
      <p className="text-xs font-bold uppercase tracking-widest text-deep-soil/50">Kelly Grappe for Secretary of State</p>
      <h1 className="font-heading mt-2 text-3xl font-bold">County planning briefings</h1>
      <p className="mt-2 text-sm leading-relaxed text-deep-soil/75">
        These pages use <strong>verified public election results and planning math</strong> at the aggregate level only — never
        individual voter data. We are rolling briefings out county by county through 2025–26.
      </p>

      {wb ? (
        <p className="mt-4 rounded-md border border-deep-soil/10 bg-cream-canvas/80 px-4 py-3 text-sm text-deep-soil/85">
          <strong>County coordination hub (sister site):</strong>{" "}
          <a href={wb} className="font-semibold text-civic-slate underline" target="_blank" rel="noopener noreferrer">
            Open the county workbench
          </a>{" "}
          for Pope-first dashboards, registration goals, and drill-downs built for county teams. This campaign site stays the SOS
          narrative; the workbench is the place for the fuller county portal experience.
        </p>
      ) : (
        <p className="mt-4 rounded-md border border-amber-200/70 bg-amber-50/80 px-4 py-2 text-sm text-amber-950">
          <strong>County workbench URL not set.</strong> Add{" "}
          <code className="rounded bg-deep-soil/5 px-1">NEXT_PUBLIC_COUNTY_WORKBENCH_URL</code> in deploy env to show a live link to
          the sister county portal.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Briefings on this site</h2>
        <ul className="mt-3 space-y-3">
          {BRIEFINGS.map((b) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className="block rounded-card border border-deep-soil/10 bg-cream-canvas p-4 shadow-sm transition hover:border-civic-slate/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-base font-bold text-deep-soil">{b.name}</span>
                  <span
                    className={
                      b.status === "live"
                        ? "rounded-full bg-field-green/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-field-green"
                        : "rounded-full bg-deep-soil/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deep-soil/60"
                    }
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-deep-soil/70">{b.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-deep-soil/60">
          <strong>Coming:</strong> additional counties as we publish the same pattern (NWA field briefs, River Valley, Delta, and
          more). See internal rollout plan: <code className="text-xs">docs/briefs/COUNTY_CANDIDATE_BRIEF_75_COUNTY_ROLLOUT.md</code>.
        </p>
      </section>

      <section className="mt-8 text-sm text-deep-soil/70">
        <h2 className="font-heading text-base font-bold text-deep-soil">Staff-only candidate briefs</h2>
        <p className="mt-1">
          Regional and opposition-research one-pagers (e.g. NWA) live in the admin board after sign-in:{" "}
          <span className="text-deep-soil/55">/admin/candidate-briefs</span> — not linked here for the public.
        </p>
      </section>
    </div>
  );
}
