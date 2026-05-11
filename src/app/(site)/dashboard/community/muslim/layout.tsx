import type { ReactNode } from "react";

import { CommunityRegionMuslimShell } from "@/components/dashboard/community/CommunityRegionMuslimShell";

export default function MuslimCommunityDashboardLayout({ children }: { children: ReactNode }) {
  return <CommunityRegionMuslimShell>{children}</CommunityRegionMuslimShell>;
}
