import Link from "next/link";
import type { StrategicBriefingDrilldownLink, StrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="list-inside list-disc space-y-1">
      {items.map((item) => (
        <li key={item.slice(0, 64)}>{item}</li>
      ))}
    </ul>
  );
}

const categoryLabel: Record<StrategicBriefingDrilldownLink["category"], string> = {
  citation: "Citations",
  claim: "Claims",
  bill: "Bills",
  county: "Counties",
  doctrine: "Doctrine",
  export: "Export",
  audit: "Audit",
  task: "Tasks",
  ai_suggestion: "AI",
  evidence: "Evidence",
  narrative: "Narratives",
  route: "Routes",
};

export function StrategicBriefingDrilldownPanel({
  paper,
}: {
  paper: StrategicBriefingPaper;
}) {
  const grouped = paper.drillDownLinks.reduce<Record<string, StrategicBriefingDrilldownLink[]>>(
    (acc, link) => {
      const key = categoryLabel[link.category] ?? link.category;
      acc[key] = acc[key] ?? [];
      acc[key].push(link);
      return acc;
    },
    {},
  );

  return (
    <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Drill-down & readiness</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Evidence health</p>
          <p className="mt-1 text-kelly-muted">{paper.readiness.evidenceHealth}</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Narrative readiness</p>
          <p className="mt-1 text-kelly-muted">{paper.readiness.narrativeReadiness}</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">County readiness</p>
          <p className="mt-1 text-kelly-muted">{paper.readiness.countyReadiness}</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Messaging readiness</p>
          <p className="mt-1 text-kelly-muted">{paper.readiness.messagingReadiness}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-kelly-navy">Evidence status</p>
          <BulletList items={paper.evidenceStatus} />
        </div>
        <div>
          <p className="text-xs font-semibold text-kelly-navy">Recommended next research</p>
          <BulletList items={paper.recommendedNextResearch} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-kelly-navy">Drill-down links</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, links]) => (
            <div key={category} className="rounded border border-kelly-text/10 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{category}</p>
              <ul className="mt-1 space-y-1">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="font-semibold text-kelly-navy underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[10px] text-kelly-subtle">
        {paper.governanceLabel} · {paper.publishability} · Generated {paper.generatedAt}
      </p>
    </section>
  );
}
