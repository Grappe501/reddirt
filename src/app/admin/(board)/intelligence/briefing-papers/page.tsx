import Link from "next/link";
import { buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { summarizeBriefingPaperQueue } from "@/lib/intelligence/intelligenceBrainCoordinator";

export const dynamic = "force-dynamic";

const BRIEF_TYPES = [
  { paperId: "morning-intelligence", label: "Morning Brief" },
  { paperId: "debate-prep", label: "Debate Brief" },
  { paperId: "county-pulaski", label: "County Brief" },
  { paperId: "candidate-talking-points", label: "Bill / Policy Brief" },
  { paperId: "morning-intelligence", label: "Media Monitoring Brief" },
  { paperId: "morning-intelligence", label: "Opposition Research Brief" },
  { paperId: "morning-intelligence", label: "Strategic Doctrine Brief" },
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc text-xs text-kelly-muted">
      {items.map((item) => (
        <li key={item.slice(0, 48)}>{item}</li>
      ))}
    </ul>
  );
}

export default async function BriefingPapersPage() {
  const queue = summarizeBriefingPaperQueue();
  const sample = buildStrategicBriefingPaper("morning-intelligence");
  const deep = sample.deepSections;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">NSI-11 · Briefing Papers</p>
        <h1 className="font-heading text-2xl font-bold">Deep Briefing Paper Browser</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          Governed composition — NON_PUBLISHABLE until human review. Browse deep brief sections for operator use.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/ai-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            AI tools
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BRIEF_TYPES.map((brief) => (
          <div key={brief.label} className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
            <p className="font-semibold text-kelly-navy">{brief.label}</p>
            <p className="mt-1 text-kelly-muted">paperId: {brief.paperId}</p>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Deep sections — sample (morning-intelligence)</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div><p className="text-xs font-semibold">Situation Overview</p><BulletList items={deep.situationOverview} /></div>
          <div><p className="text-xs font-semibold">Why This Matters Today</p><BulletList items={deep.whyThisMattersToday} /></div>
          <div><p className="text-xs font-semibold">What Changed</p><BulletList items={deep.whatChangedSinceLastBrief} /></div>
          <div><p className="text-xs font-semibold">Political Impact</p><BulletList items={deep.politicalImpact} /></div>
          <div><p className="text-xs font-semibold">County Impact</p><BulletList items={deep.countyImpactDeep} /></div>
          <div><p className="text-xs font-semibold">Voter Impact</p><BulletList items={deep.voterImpactDeep} /></div>
          <div><p className="text-xs font-semibold">Debate Use</p><BulletList items={deep.debateUse} /></div>
          <div><p className="text-xs font-semibold">Media Use</p><BulletList items={deep.mediaUse} /></div>
          <div><p className="text-xs font-semibold">Evidence Weaknesses</p><BulletList items={deep.evidenceWeaknesses} /></div>
          <div><p className="text-xs font-semibold">Strategic Risks</p><BulletList items={deep.strategicRisks} /></div>
          <div><p className="text-xs font-semibold">Suggested Talking Point Drafts</p><BulletList items={deep.suggestedTalkingPointDrafts} /></div>
          <div><p className="text-xs font-semibold">What Not To Say</p><BulletList items={deep.whatNotToSay} /></div>
          <div><p className="text-xs font-semibold">Open Questions</p><BulletList items={deep.openQuestions} /></div>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Briefing queue</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {queue.map((row) => (
            <li key={row.paperId}>
              <Link href={row.href} className="font-semibold text-kelly-navy underline">
                {row.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
