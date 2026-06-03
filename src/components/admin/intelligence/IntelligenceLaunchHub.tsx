import Link from "next/link";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import { summarizeHumanActionQueue } from "@/lib/intelligence/strategicDecisionSupport";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-navy/15 bg-white p-4 shadow-sm transition hover:border-kelly-navy/40";

type HubCard = {
  title: string;
  href: string;
  status: string;
  warning?: string;
  safeLabel?: string;
};

export function IntelligenceLaunchHub() {
  const archive = tryIntelligenceLoad("opposition-archive-rollup", () => loadOppositionArchiveRollup(), null);
  const claims = tryIntelligenceLoad("claim-ledger", () => summarizeClaimLedger(), null);
  const actions = tryIntelligenceLoad("action-queue", () => summarizeHumanActionQueue(), null);
  const llm = tryIntelligenceLoad("llm-queue", () => summarizeDraftReviewQueue(), null);
  const legislative = tryIntelligenceLoad("legislative-video", () => buildLegislativeVideoIntelligenceRollup(), null);

  const directClipCount = archive?.directClipCount ?? 0;
  const retrievalComplete = archive?.retrievalTasksComplete ?? 0;
  const retrievalTotal = archive?.retrievalTasksTotal ?? 7;
  const claimTotal = claims?.totalClaims ?? 0;
  const needsReview = claims?.needsReviewClaims ?? 0;
  const approvedPublic = claims?.approvedPublicAdaptation ?? 0;
  const actionTotal = actions?.totalActions ?? 0;
  const urgentActions = actions?.urgentCount ?? 0;
  const pendingLlm = llm?.pendingCount ?? 0;
  const videoCandidates = legislative?.videoCandidatesTotal ?? 0;
  const chunkCount = legislative?.chunkCount ?? 0;
  const automationNote = legislative?.automationNote ?? "No production transcripts available";

  const cards: HubCard[] = [
    {
      title: "Debate Command Center",
      href: "/admin/intelligence/debate-command",
      status: "Live — computed readiness (internal only)",
      warning: directClipCount < 2 ? "Film room clip archive thin" : undefined,
      safeLabel: "Safe internal use",
    },
    {
      title: "Kim Hammer Debate Prep",
      href: "/admin/intelligence/kim-hammer/debate-prep",
      status: "14-section prep briefing",
      warning: `${retrievalComplete}/${retrievalTotal} retrieval tasks complete`,
      safeLabel: "Safe internal use",
    },
    {
      title: "Evidence Command",
      href: "/admin/intelligence/kim-hammer/evidence-command",
      status: "Citation locker + export control",
      warning: "Export-ready claims require human promotion",
      safeLabel: "Safe internal use",
    },
    {
      title: "Claims Ledger",
      href: "/admin/intelligence/claims",
      status: `${claimTotal} claims · ${approvedPublic} public-adaptation approved`,
      warning: needsReview > 0 ? `${needsReview} need review` : "Claim not export-ready until promoted",
      safeLabel: "Trace sources before use",
    },
    {
      title: "Human Action Queue",
      href: "/admin/intelligence/action-queue",
      status: `${actionTotal} open actions`,
      warning: urgentActions > 0 ? `${urgentActions} urgent` : undefined,
      safeLabel: "Assign retrieval owners here",
    },
    {
      title: "Legislative Video",
      href: "/admin/intelligence/legislative-video",
      status: `${videoCandidates} candidates · ${chunkCount} chunks`,
      warning: chunkCount === 0 ? automationNote : undefined,
      safeLabel: "Run pipeline when ffmpeg configured",
    },
    {
      title: "LLM Review Queue",
      href: "/admin/intelligence/llm-review-queue",
      status: `${pendingLlm} drafts pending`,
      warning: "All AI output NON_PUBLISHABLE until reviewed",
      safeLabel: "No auto-publish",
    },
    {
      title: "Institutional Memory",
      href: "/admin/intelligence/memory",
      status: "NSI-17 decision ledger",
      safeLabel: "Safe internal use",
    },
  ];

  return (
    <section className="mb-8">
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Debate week</p>
        <h2 className="font-heading text-2xl font-bold text-kelly-navy">Opposition &amp; debate prep — start here</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          Use the tabs above for every surface. Review claims and LLM drafts before any public use.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <Link key={item.href} href={item.href} className={card}>
            <h3 className="font-heading text-lg font-bold text-kelly-navy">{item.title}</h3>
            <p className="mt-2 text-xs text-kelly-muted">{item.status}</p>
            {item.warning ? <p className="mt-2 text-xs font-semibold text-amber-900">{item.warning}</p> : null}
            {item.safeLabel ? (
              <p className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-teal-800">{item.safeLabel}</p>
            ) : null}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/intelligence/command-center" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Command center
        </Link>
        <Link href="/admin/intelligence/kim-hammer" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Kim Hammer hub
        </Link>
        <Link href="/admin/intelligence/scenario-simulation" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Scenario simulation
        </Link>
        <Link href="/admin/intelligence/kim-hammer/debate-ai-workbench" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Debate AI workbench
        </Link>
      </div>
    </section>
  );
}
