import Link from "next/link";

const BRIEFS = [
  {
    slug: "nwa-benton-washington",
    title: "NWA — Benton & Washington Counties",
    subtitle: "Regional field brief: KPI slots, strategy, opposition bills (elections + initiatives), per-county breakdown.",
    sourceFile: "docs/briefs/KELLY_NWA_BENTON_WASHINGTON_CANDIDATE_BRIEF.md",
  },
] as const;

export default function AdminCandidateBriefsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Candidate briefs (CM)</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Dense, internal one-pagers for the candidate and field leads. Source files live in the repo; this hub links to
        rendered views. Not public. Public county-by-county plan: <code className="text-xs">docs/briefs/COUNTY_CANDIDATE_BRIEF_75_COUNTY_ROLLOUT.md</code> — hub:{" "}
        <a className="font-semibold text-civic-slate underline" href="/county-briefings">
          /county-briefings
        </a>
        .
      </p>
      <ul className="mt-8 space-y-3">
        {BRIEFS.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/admin/candidate-briefs/${b.slug}`}
              className="block rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-sm transition hover:border-red-dirt/20"
            >
              <h2 className="font-heading text-lg font-bold text-deep-soil">{b.title}</h2>
              <p className="mt-1 font-body text-sm text-deep-soil/70">{b.subtitle}</p>
              <p className="mt-2 font-mono text-[10px] text-deep-soil/45">{b.sourceFile}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
