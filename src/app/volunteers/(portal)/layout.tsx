import type { ReactNode } from "react";

import "@/app/election-plan/election-plan.css";
import { VolunteerHubLogoutButton, VolunteerHubPortalHeader } from "@/components/volunteers/VolunteerHubShell";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function VolunteerHubPortalLayout({ children }: { children: ReactNode }) {
  const leader = await loadCurrentVolunteerLeader();

  return (
    <div className="ep-portal-shell min-h-screen bg-[var(--ep-cream)]">
      {leader ? (
        <VolunteerHubPortalHeader
          displayName={leader.displayName}
          initials={leader.initials}
          commandAccess={leader.commandAccess}
        />
      ) : null}
      {children}
      <VolunteerHubLogoutButton />
    </div>
  );
}
