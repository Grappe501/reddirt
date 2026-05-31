import type { DailyIntelligencePacket } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import type { GovernedBriefRegistry } from "@/lib/intelligence/briefs/briefRegistry";
import { PrepareLlmEvidencePacketButton } from "@/components/admin/intelligence/PrepareLlmEvidencePacketButton";
import Link from "next/link";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function ReadinessPill({ label, count, tone }: { label: string; count: number; tone: "ok" | "warn" | "risk" }) {
  const cls =
    tone === "ok"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : tone === "warn"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : "border-rose-300 bg-rose-50 text-rose-950";
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="font-heading text-xl font-bold">{count}</p>
    </div>
  );
}

export function PublicBriefGradeIntelligencePanel({
  packet,
  registry,
}: {
  packet: DailyIntelligencePacket;
  registry: GovernedBriefRegistry;
}) {
  const rollup = registry.countyPublicBriefRollup;
  const opposition = registry.oppositionDebate.opposition;
  const debate = registry.oppositionDebate.debatePrep;
  const rapid = registry.oppositionDebate.rapidResponse;

  return (
    <section className="mb-6 rounded-2xl border-2 border-emerald-900/25 bg-emerald-50/30 p-5">
      <header className="mb-4 border-b border-emerald-900/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-900">
          Public-Brief-Grade Intelligence
        </p>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Governed internal brief system</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          All briefs: INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · NOT_PUBLIC_CONTENT
        </p>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ReadinessPill label="Public brief ready" count={rollup.PUBLIC_BRIEF_READY} tone="ok" />
        <ReadinessPill label="Internal message source" count={rollup.INTERNAL_MESSAGE_SOURCE_ONLY} tone="warn" />
        <ReadinessPill label="Field planning only" count={rollup.FIELD_PLANNING_ONLY} tone="warn" />
        <ReadinessPill label="Shell only" count={rollup.SHELL_ONLY} tone="risk" />
        <ReadinessPill label="Blocked" count={rollup.BLOCKED} tone="risk" />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Opposition brief readiness</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{opposition.confidenceScore}/100</p>
          <p className="text-xs text-kelly-muted">{opposition.status} · {opposition.publishabilityStatus}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Debate prep brief</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{debate.confidenceScore}/100</p>
          <p className="text-xs text-kelly-muted">{debate.researchGaps.length} film-room gaps flagged</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Message intelligence</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{packet.messageIntelligenceReadinessScore}/100</p>
          <p className="text-xs text-kelly-muted">Guidance only — no public copy</p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What can we say safely?</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {packet.brainAnswers.whatCanWeSaySafely.map((line) => (
              <li key={line.slice(0, 60)}>{line}</li>
            ))}
          </ul>
        </article>
        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-800">Known but not public yet</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-900">
            {packet.brainAnswers.knownButNotPublic.map((line) => (
              <li key={line.slice(0, 60)}>{line}</li>
            ))}
          </ul>
        </article>
        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Kelly — say this week (internal)</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {packet.brainAnswers.kellySayThisWeek.map((line) => (
              <li key={line.slice(0, 60)}>{line}</li>
            ))}
          </ul>
        </article>
        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">Kelly — avoid this week</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
            {packet.brainAnswers.kellyAvoidThisWeek.map((line) => (
              <li key={line.slice(0, 60)}>{line}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className={`${card} mb-4`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top 10 research gaps blocking public messaging</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-kelly-muted">
          {registry.topResearchGapsBlockingPublicMessaging.map((gap) => (
            <li key={gap.slice(0, 80)}>{gap}</li>
          ))}
        </ol>
      </article>

      <article className={`${card} mb-4`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Brief queue (internal)</h3>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Opposition: {opposition.title} — {opposition.researchGaps.length} gaps</li>
          <li>Debate prep: {debate.title}</li>
          <li>Rapid response: {rapid.title} — {rapid.confidenceScore}/100</li>
          <li>75 county public messaging briefs in data/intelligence/briefs/county/</li>
          <li>LLM live drafting: {registry.llmContract.liveLlmEnabled ? "enabled" : "deferred"} — {registry.llmContract.liveLlmReason}</li>
        </ul>
        <div className="mt-3 space-y-2">
          <PrepareLlmEvidencePacketButton briefId={opposition.briefId} label="Prepare opposition evidence packet" />
          <PrepareLlmEvidencePacketButton briefId={debate.briefId} label="Prepare debate evidence packet" />
          <PrepareLlmEvidencePacketButton briefId={rapid.briefId} label="Prepare rapid response evidence packet" />
        </div>
      </article>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href="/admin/intelligence/command-center" className="rounded border border-kelly-navy/30 bg-kelly-navy px-3 py-1 font-bold text-white">
          NSI-16 weekly packet
        </Link>
        <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          LLM review queue
        </Link>
        <Link href="/admin/intelligence/claims" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          Claim ledger
        </Link>
        <Link href="/admin/intelligence/debate-command" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          Debate command
        </Link>
        <Link href="/admin/county-intelligence" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          County workbench
        </Link>
      </div>
    </section>
  );
}
