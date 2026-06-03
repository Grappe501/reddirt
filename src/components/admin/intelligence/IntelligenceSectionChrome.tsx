"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IntelligenceCandidateOrientation } from "@/components/admin/intelligence/IntelligenceCandidateOrientation";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";
import { IntelligenceGovernanceStrip } from "@/components/admin/intelligence/IntelligenceGovernanceStrip";

const DEBATE_LAUNCH =
  process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate";

/** Shared chrome for /admin/intelligence/* — launch mode: governance strip only (sidebar has nav). */
export function IntelligenceSectionChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const onHub = pathname === "/admin/intelligence";

  return (
    <>
      <IntelligenceGovernanceStrip />
      {DEBATE_LAUNCH ? null : (
        <>
          {onHub ? null : <IntelligenceCandidateOrientation />}
          <IntelligenceDebateSubnav />
        </>
      )}
      {children}
    </>
  );
}
