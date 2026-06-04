import Link from "next/link";
import type { HumanActionQueueSummary } from "@/lib/intelligence/types/humanActionQueue";

const DEBATE_LINKS = [
  { href: "/admin/intelligence/claims", label: "Claims (Kelly firewall)" },
  { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" },
  { href: "/admin/intelligence/llm-review-queue", label: "LLM review queue" },
  { href: "/admin/intelligence/debate-command", label: "Debate command" },
  { href: "/admin/intelligence/sos-debate-questions", label: "Expected SOS questions" },
] as const;

type ActionQueueDebateWeekLeadProps = {
  summary: HumanActionQueueSummary;
  usedFastPath: boolean;
  showV4FallbackNote: boolean;
};

export function ActionQueueDebateWeekLead({
  summary,
  usedFastPath,
  showV4FallbackNote,
}: ActionQueueDebateWeekLeadProps) {
  return (
    <section className="mb-6 space-y-4">
      <article className="rounded-xl border-2 border-violet-200 bg-violet-50/50 p-5 text-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-950">What this page is for</p>
        <p className="mt-2 leading-relaxed text-kelly-muted">
          Staff assignment queue from opposition research, scenarios, and citation review. Each row is a{" "}
          <strong>recommendation only</strong> — humans execute through claims, evidence command, and retrieval
          workflows. Kelly does not work this queue live on stage.
        </p>
        {usedFastPath ? (
          <p className="mt-2 text-xs font-semibold text-emerald-900">
            Debate-week fast load — persisted queue only (no 60s regeneration on Netlify).
          </p>
        ) : null}
        {showV4FallbackNote ? (
          <p className="mt-2 text-xs text-amber-900">
            Persisted queue empty or unavailable — v4 retrieval tasks shown below as fallback.
          </p>
        ) : null}
      </article>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
          <p className="font-bold uppercase text-amber-900">Urgent</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.urgentCount}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs">
          <p className="font-bold uppercase text-rose-900">Blocked</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.blockedCount}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs">
          <p className="font-bold uppercase text-emerald-900">Debate prep</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.debatePrepActions.length}</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
          <p className="font-bold uppercase text-kelly-subtle">Active</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.totalActions}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {DEBATE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-kelly-navy/25 bg-white px-3 py-1.5 font-bold text-kelly-navy hover:bg-kelly-page"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
