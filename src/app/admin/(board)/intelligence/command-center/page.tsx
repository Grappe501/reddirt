import Link from "next/link";
import { composeIntelligenceCommandCenter } from "@/lib/intelligence/commandCenter/intelligenceCommandCenter";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { CommandCenterDashboard } from "./CommandCenterDashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export default async function IntelligenceCommandCenterPage() {
  const snapshot = tryIntelligenceLoad(
    "command-center",
    () =>
      composeIntelligenceCommandCenter(undefined, {
        syncActionQueue: !isIntelligenceOppositionDebateLaunchMode(),
      }),
    null,
  );
  if (!snapshot) {
    return (
      <div className="mx-auto max-w-2xl text-kelly-text">
        <p className="text-sm text-kelly-muted">Command center snapshot unavailable. Use the hub or debate prep.</p>
        <Link href="/admin/intelligence" className="mt-2 inline-block text-sm font-bold text-kelly-navy underline">
          Back to start here
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-16 · Campaign Operations Command Center
        </p>
        <h1 className="font-heading text-2xl font-bold">Intelligence Command Center</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Daily operator war room — one surface for what changed, what matters, what is blocked, and what requires human
          review. Composes NSI-1–15 systems; does not execute actions or publish content.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link
            href="/admin/intelligence"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Intelligence hub
          </Link>
          <Link
            href={snapshot.sourceLinks.morningBrief}
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Morning brief
          </Link>
          <Link
            href={snapshot.sourceLinks.actionQueue}
            className="rounded border border-teal-700/30 bg-teal-50 px-2 py-1 font-semibold text-teal-900"
          >
            Action queue
          </Link>
          <Link
            href={snapshot.sourceLinks.evidenceCommand}
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Evidence Command
          </Link>
          <Link
            href={snapshot.sourceLinks.campaignMemory}
            className="rounded border border-violet-700/30 bg-violet-50 px-2 py-1 font-semibold text-violet-900"
          >
            Campaign memory
          </Link>
        </div>
      </header>

      <CommandCenterDashboard snapshot={snapshot} />
    </div>
  );
}
