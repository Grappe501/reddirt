import Link from "next/link";
import type { CopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-types";

type Props = {
  brief: CopilotIntelligenceBrief;
  compact?: boolean;
};

export function CopilotBriefCard({ brief, compact }: Props) {
  if (compact) {
    return (
      <div className="rounded-xl border border-kelly-navy/12 bg-kelly-page/90 p-3 text-sm">
        <p className="text-[10px] font-bold uppercase text-kelly-slate">{brief.snapshot.label} copilot</p>
        <p className="mt-1 text-kelly-navy">{brief.recommendedNextTask.title}</p>
        <Link href={`/admin/ai-command-center/copilots?role=${brief.snapshot.role}`} className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          Full copilot brief →
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-kelly-navy/15 bg-kelly-page p-4">
      <header className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-kelly-slate">Copilot brief</p>
          <h3 className="font-heading text-lg font-bold text-kelly-navy">{brief.snapshot.label}</h3>
        </div>
        <span className="text-[10px] font-bold uppercase text-kelly-muted">
          {brief.confidence} confidence · L{brief.snapshot.progressionLevel}
        </span>
      </header>
      <p className="mt-2 text-sm text-kelly-muted">{brief.snapshot.mission}</p>
      <p className="mt-3 text-sm">
        <strong className="text-kelly-navy">Next:</strong> {brief.recommendedNextTask.title}
        <span className="text-kelly-muted"> (~{brief.recommendedNextTask.estimatedMinutes} min)</span>
      </p>
      {brief.riskWarnings.length > 0 ? (
        <ul className="mt-2 text-xs text-amber-900">
          {brief.riskWarnings.slice(0, 2).map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={brief.trainingRecommendation.href} className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
          Training
        </Link>
        <Link href="/admin/ai-command-center/copilots" className="rounded-full bg-kelly-navy px-3 py-1 text-xs font-bold text-white">
          All copilots
        </Link>
      </div>
    </article>
  );
}
