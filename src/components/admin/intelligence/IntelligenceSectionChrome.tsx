"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IntelligenceCandidateOrientation } from "@/components/admin/intelligence/IntelligenceCandidateOrientation";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";
import { IntelligenceKimHammerSubnav } from "@/components/admin/intelligence/IntelligenceKimHammerSubnav";
import { NavVisitRecorder } from "@/components/admin/intelligence/NavVisitRecorder";
import { NavNewLinksBanner } from "@/components/admin/intelligence/NavNewLinksBanner";
import { FieldBookCanonPanel } from "@/components/admin/intelligence/FieldBookCanonPanel";
import { ThreeLaneNavLegend } from "@/components/admin/intelligence/ThreeLaneNavLegend";
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
  const onKimHammer = pathname.startsWith("/admin/intelligence/kim-hammer");

  const inner = (
    <>
      <NavVisitRecorder />
      {CANDIDATE_IPAD ? null : <IntelligenceGovernanceStrip />}
      <NavNewLinksBanner />
      <ThreeLaneNavLegend compact />
      {onKimHammer ? <IntelligenceKimHammerSubnav /> : null}
      {CANDIDATE_IPAD ? null : (
        <>
          {!DEBATE_LAUNCH && !onHub ? <IntelligenceCandidateOrientation /> : null}
          <IntelligenceDebateSubnav />
        </>
      )}
      <FieldBookCanonPanel compact />
      {children}
    </>
  );

  if (CANDIDATE_IPAD) {
    return <CandidateIpadIntelligenceShell>{inner}</CandidateIpadIntelligenceShell>;
  }

  return inner;
}
