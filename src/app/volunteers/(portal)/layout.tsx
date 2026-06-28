import type { ReactNode } from "react";

import "@/app/election-plan/election-plan.css";
import { VolunteerHubLogoutButton, VolunteerHubPortalHeader } from "@/components/volunteers/VolunteerHubShell";
import { loadVolunteerBoardSnapshot, tryLoadVolunteerBoardSession } from "@/lib/volunteers/board/load-volunteer-board";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function VolunteerHubPortalLayout({ children }: { children: ReactNode }) {
  const [leader, boardSession] = await Promise.all([
    tryLoadCurrentVolunteerLeader(),
    tryLoadVolunteerBoardSession(),
  ]);

  let boardName: string | null = null;
  if (boardSession) {
    const snap = await loadVolunteerBoardSnapshot(boardSession.userId, boardSession.volunteerProfileId);
    boardName = snap?.displayName ?? null;
  }

  return (
    <div className="ep-portal-shell min-h-screen bg-[var(--ep-cream)]">
      {leader ? (
        <VolunteerHubPortalHeader
          displayName={leader.displayName}
          initials={leader.initials}
          commandAccess={leader.commandAccess}
        />
      ) : boardName ? (
        <header className="border-b border-[var(--ep-navy)]/10 bg-white/80 px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-navy-muted)]">
            Volunteer board · {boardName}
          </p>
        </header>
      ) : null}
      {children}
      {leader ? <VolunteerHubLogoutButton /> : null}
    </div>
  );
}
