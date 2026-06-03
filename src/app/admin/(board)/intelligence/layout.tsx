import type { ReactNode } from "react";
import { IntelligenceSectionChrome } from "@/components/admin/intelligence/IntelligenceSectionChrome";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function IntelligenceSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <IntelligenceSectionChrome>{children}</IntelligenceSectionChrome>
    </div>
  );
}
