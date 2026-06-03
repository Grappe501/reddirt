import type { ReactNode } from "react";
import { IntelligenceDebateSubnav } from "@/components/admin/intelligence/IntelligenceDebateSubnav";

export default function IntelligenceSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <IntelligenceDebateSubnav />
      {children}
    </div>
  );
}
