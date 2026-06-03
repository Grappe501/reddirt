import Link from "next/link";
import { DEBATE_WEEK_EXTENDED_NAV_ITEMS, DEBATE_WEEK_PRIMARY_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";
import type { IntelligenceLaunchHubStats } from "@/lib/intelligence/intelligenceLaunchHubStats";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-navy/15 bg-white p-4 shadow-sm transition hover:border-kelly-navy/40";

type HubCard = {
  title: string;
  href: string;
  status: string;
  warning?: string;
  safeLabel?: string;
};

export function IntelligenceLaunchHub({ stats }: { stats: IntelligenceLaunchHubStats }) {
  const archive = stats.archive;
  const claims = stats.claims;
  const actions = stats.actions;
  const llm = stats.llm;
  const legislative = stats.legislative;

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

  const primaryCards: HubCard[] = DEBATE_WEEK_PRIMARY_NAV_ITEMS.map((item, index) => {
    const base: HubCard = {
      title: `Step ${index + 1}: ${item.label}`,
      href: item.href,
      status: item.description ?? "",
      safeLabel: "Internal use only",
    };
    if (item.href === "/admin/intelligence/debate-command" && directClipCount < 2) {
      base.warning = "Film room clip archive thin";
    }
    if (item.href === "/admin/intelligence" && needsReview > 0) {
      base.warning = `${needsReview} claims need review`;
    }
    if (item.href === "/admin/intelligence/kim-hammer/debate-prep") {
      base.warning = `${retrievalComplete}/${retrievalTotal} retrieval tasks complete`;
    }
    if (item.href === "/admin/intelligence/claims") {
      base.status = `${claimTotal} claims · ${needsReview} need review before use`;
    }
    return base;
  });

  return (
    <section className="mb-8">
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Quick links</p>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Same five steps as above — with live status</h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {primaryCards.map((item) => (
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
        <span className="w-full text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Staff tools</span>
        {DEBATE_WEEK_EXTENDED_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            {item.label}
            {item.href === "/admin/intelligence/action-queue" && urgentActions > 0 ? ` (${urgentActions} urgent)` : null}
            {item.href === "/admin/intelligence/llm-review-queue" && pendingLlm > 0 ? ` (${pendingLlm})` : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
