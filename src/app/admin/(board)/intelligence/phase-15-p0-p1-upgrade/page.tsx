import Link from "next/link";
import { Phase15P0P1UpgradePassPanel } from "@/components/admin/intelligence/Phase15P0P1UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  assertPhase15P0P1Bar,
  CANDIDATE_COMMAND_HOME_HREF,
  computePhase15P0P1UpgradePass,
} from "@/lib/intelligence/v4/phase15Closure";

export const dynamic = "force-dynamic";

export default function Phase15P0P1UpgradePage() {
  const report = computePhase15P0P1UpgradePass();
  const bar = assertPhase15P0P1Bar();
  const sections = buildCandidateCommandNavSections("CANDIDATE");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P0+P1"
        title="Candidate command experience"
        description="Nav collapse into five orchestrated sections with builder infra hidden from candidate profile, plus unified command home with readiness and claims-gated safe/blocked lines."
      >
        <V4BackLinks />
        <Link
          href={CANDIDATE_COMMAND_HOME_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/supreme-workbench"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Supreme workbench (staff)
        </Link>
      </V4PageHeader>

      <Phase15P0P1UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P0+P1 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p0-p1-candidate-command.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        {sections.map((sec) => (
          <article key={sec.id} className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
            <h3 className="font-bold text-kelly-navy">{sec.label}</h3>
            <p className="mt-1 text-xs text-kelly-muted">{sec.summary}</p>
            <ul className="mt-3 space-y-1 text-xs">
              {sec.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-semibold text-indigo-950 underline">
                    {link.label}
                  </Link>
                  {link.description ? <span className="text-kelly-muted"> — {link.description}</span> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
