import type { ReactNode } from "react";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";
import { IntelligenceEmergencyLaunchBanner } from "@/components/admin/intelligence/IntelligenceEmergencyLaunchBanner";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";

export default function IntelligenceSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {isIntelligenceOppositionDebateLaunchMode() ? <IntelligenceEmergencyLaunchBanner /> : null}
      <IntelligenceDebateSubnav />
      {children}
    </div>
  );
}
