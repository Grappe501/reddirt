import Link from "next/link";
import { buildMessageIntelligenceEngine } from "@/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import type { MessageRecommendation } from "@/lib/intelligence/messageIntelligence/messageIntelligenceTypes";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function RecList({ title, items, tone }: { title: string; items: MessageRecommendation[]; tone?: "safe" | "risk" }) {
  const toneClass =
    tone === "risk" ? "text-rose-900" : tone === "safe" ? "text-emerald-900" : "text-kelly-muted";
  return (
    <div className={card}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-kelly-navy">{title}</h3>
      <ul className={`mt-2 list-inside list-disc text-xs ${toneClass}`}>
        {items.length ? (
          items.slice(0, 6).map((item) => (
            <li key={item.id}>
              {item.text.slice(0, 140)}
              {item.citationDepthScore > 0 ? (
                <span className="text-kelly-subtle"> · cite depth {item.citationDepthScore}</span>
              ) : null}
            </li>
          ))
        ) : (
          <li>None indexed yet</li>
        )}
      </ul>
    </div>
  );
}

export function AdminMessageIntelligencePanel() {
  const rollup = buildMessageIntelligenceEngine();

  return (
    <section className={`${card} mb-6 border-2 border-teal-800/25 bg-teal-50/20`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Message Intelligence Engine 1.0</p>
          <h2 className="font-heading text-xl font-bold text-kelly-navy">Internal message guidance (not public copy)</h2>
          <p className="mt-1 text-xs font-semibold text-amber-900">
            {rollup.governance.labels.join(" · ")}
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-4 py-2 text-center">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Readiness</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{rollup.readinessScore}/100</p>
        </div>
      </div>

      <p className="mt-2 text-xs text-kelly-muted">{rollup.readinessBasis}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecList title="Strongest evidence-backed themes" items={rollup.strongestEvidenceAngles} tone="safe" />
        <RecList title="Risky / unsafe themes" items={[...rollup.riskyMessageThemes, ...rollup.weakestUnsafeAngles]} tone="risk" />
        <RecList title="Citation gaps" items={rollup.claimsNeedingCitation} />
        <RecList title="Claims needing human review" items={rollup.claimsNeedingHumanReview} />
        <RecList title="Debate message lanes (internal)" items={rollup.debateMessageLanes} />
        <RecList title="Transcript-derived opportunities" items={rollup.usableInternalTalkingPoints} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/intelligence/legislative-video" className="rounded border px-2 py-1 font-semibold text-kelly-navy underline">
          Legislative video pipeline
        </Link>
        <Link href="/admin/intelligence/debate-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy underline">
          Debate command
        </Link>
        <Link href="/admin/intelligence/claims" className="rounded border px-2 py-1 font-semibold text-kelly-navy underline">
          Claim ledger
        </Link>
        <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy underline">
          LLM review queue
        </Link>
      </div>
    </section>
  );
}
