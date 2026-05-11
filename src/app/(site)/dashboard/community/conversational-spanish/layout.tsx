import type { ReactNode } from "react";

import { CommunityRegionScaffoldShell } from "@/components/dashboard/community/CommunityRegionScaffoldShell";
import { CONVERSATIONAL_SPANISH_DASHBOARD_BASE } from "@/lib/campaign-ops/community-region-scaffold";

export default function ConversationalSpanishLayout({ children }: { children: ReactNode }) {
  return (
    <CommunityRegionScaffoldShell
      dashboardBasePath={CONVERSATIONAL_SPANISH_DASHBOARD_BASE}
      displayName="Conversational Spanish region"
      geography="Arkansas"
    >
      {children}
    </CommunityRegionScaffoldShell>
  );
}
