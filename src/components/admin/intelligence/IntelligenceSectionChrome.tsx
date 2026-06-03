"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IntelligenceCandidateOrientation } from "@/components/admin/intelligence/IntelligenceCandidateOrientation";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";
import { IntelligenceGovernanceStrip } from "@/components/admin/intelligence/IntelligenceGovernanceStrip";

/** Shared chrome for all /admin/intelligence/* pages. */
export function IntelligenceSectionChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const onHub = pathname === "/admin/intelligence";

  return (
    <>
      <IntelligenceGovernanceStrip />
      {onHub ? null : <IntelligenceCandidateOrientation />}
      <IntelligenceDebateSubnav />
      {children}
    </>
  );
}
