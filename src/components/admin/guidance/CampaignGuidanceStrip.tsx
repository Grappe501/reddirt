"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildCopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-engine";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { recommendTrainingForPathname } from "@/lib/agents/training/training-recommendation-engine";

type Props = {
  role?: RoleCopilotId;
  pathname?: string;
  pageLabel?: string;
  compact?: boolean;
};

export function CampaignGuidanceStrip({ role = "campaign_manager", pathname = "", pageLabel, compact }: Props) {
  const intel = useMemo(
    () => buildCopilotIntelligenceBrief({ role, pathname, skillLevel: "intermediate" }),
    [role, pathname],
  );
  const training = useMemo(
    () => (pathname ? recommendTrainingForPathname(pathname, role) : null),
    [pathname, role],
  );

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-kelly-navy/10 bg-kelly-navy/[0.03] px-3 py-2 text-xs text-kelly-muted">
        <span>
          <strong className="text-kelly-navy">Copilot:</strong> {intel.recommendedNextTask.title}
        </span>
        <Link href={`/admin/ai-command-center/copilots?role=${role}`} className="font-bold text-kelly-navy underline">
          Copilot
        </Link>
        <Link href={`/admin/training?role=${role}`} className="font-bold text-kelly-navy underline">
          Training
        </Link>
      </div>
    );
  }

  return (
    <aside className="rounded-2xl border border-kelly-navy/12 bg-kelly-page/80 p-4 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">
        {pageLabel ? `Help · ${pageLabel}` : "Need help with this?"}
      </p>
      <p className="mt-1 text-kelly-navy">
        <strong>Your copilot says:</strong> {intel.snapshot.mission}
      </p>
      <p className="mt-1 text-xs text-kelly-muted">
        <strong>Next task:</strong> {intel.recommendedNextTask.title} (~{intel.recommendedNextTask.estimatedMinutes} min)
      </p>
      {training ? (
        <p className="mt-2 text-xs text-kelly-muted">
          Training for this page:{" "}
          <Link href={`/admin/training?role=${role}&module=${training.moduleId}`} className="font-bold text-kelly-navy underline">
            {training.title}
          </Link>
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/admin/training?role=${role}`} className="rounded-full border border-kelly-navy/20 px-3 py-1 text-xs font-bold text-kelly-navy">
          Training center
        </Link>
        <Link href="/admin/ai-command-center" className="rounded-full border border-kelly-navy/20 px-3 py-1 text-xs font-bold text-kelly-navy">
          Command center
        </Link>
        <Link href="/admin/onboarding" className="rounded-full border border-kelly-navy/20 px-3 py-1 text-xs font-bold text-kelly-muted">
          First time here?
        </Link>
      </div>
    </aside>
  );
}
