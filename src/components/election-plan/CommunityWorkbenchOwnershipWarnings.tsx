"use client";

import Link from "next/link";

import type { CommunityOwnershipWarning } from "@/lib/election-plan/community-workbench/ownership-warnings";

type Props = {
  warnings: CommunityOwnershipWarning[];
  slug: string;
};

export function CommunityWorkbenchOwnershipWarnings({ warnings, slug }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">
        {warnings.length} ownership gap{warnings.length === 1 ? "" : "s"} — assign before field rollout
      </p>
      <ul className="mt-2 space-y-1 text-xs">
        {warnings.slice(0, 6).map((w, i) => (
          <li key={`${w.kind}-${i}`}>
            {w.kind === "event_no_lead" ? (
              <>
                {w.message}{" "}
                <Link href={`/election-plan/workbenches/${slug}#events`} className="underline">
                  Edit event
                </Link>
              </>
            ) : w.kind === "committee_no_members" ? (
              <>
                {w.message}{" "}
                <Link href={`/election-plan/workbenches/${slug}#committees`} className="underline">
                  Edit committee
                </Link>
              </>
            ) : (
              <>
                {w.message}{" "}
                <Link href={`/election-plan/workbenches/${slug}#leadership`} className="underline">
                  Assign lead
                </Link>
              </>
            )}
          </li>
        ))}
        {warnings.length > 6 ? <li className="italic">+{warnings.length - 6} more</li> : null}
      </ul>
    </div>
  );
}
