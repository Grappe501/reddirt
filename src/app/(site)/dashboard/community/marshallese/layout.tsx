import type { ReactNode } from "react";

import { CommunityRegionScaffoldShell } from "@/components/dashboard/community/CommunityRegionScaffoldShell";
import { MARSHALLESE_DASHBOARD_BASE } from "@/lib/campaign-ops/community-region-scaffold";

export default function MarshalleseLayout({ children }: { children: ReactNode }) {
  return (
    <CommunityRegionScaffoldShell
      dashboardBasePath={MARSHALLESE_DASHBOARD_BASE}
      displayName="Marshallese region"
      geography="Arkansas"
    >
      {children}
    </CommunityRegionScaffoldShell>
  );
}
