"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IntelligenceCandidateOrientation } from "@/components/admin/intelligence/IntelligenceCandidateOrientation";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";
import { IntelligenceGovernanceStrip } from "@/components/admin/intelligence/IntelligenceGovernanceStrip";
import { CandidateIpadIntelligenceShell } from "@/components/admin/intelligence/CandidateIpadIntelligenceShell";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";

const DEBATE_LAUNCH =
  process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate";

const CANDIDATE_IPAD = isCandidateIpadMode();

/** Shared chrome for /admin/intelligence/* — launch mode: governance strip only (sidebar has nav). */
export function IntelligenceSectionChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const onHub = pathname === "/admin/intelligence";

  const inner = (
    <>
      {CANDIDATE_IPAD ? null : <IntelligenceGovernanceStrip />}
      {CANDIDATE_IPAD || DEBATE_LAUNCH ? null : (
        <>
          {onHub ? null : <IntelligenceCandidateOrientation />}
          <IntelligenceDebateSubnav />
        </>
      )}
      {children}
    </>
  );

  if (CANDIDATE_IPAD) {
    return <CandidateIpadIntelligenceShell>{inner}</CandidateIpadIntelligenceShell>;
  }

  return inner;
}
