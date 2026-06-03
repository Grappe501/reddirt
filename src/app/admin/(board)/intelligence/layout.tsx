import type { ReactNode } from "react";
import { IntelligenceSectionChrome } from "@/components/admin/intelligence/IntelligenceSectionChrome";

export default function IntelligenceSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <IntelligenceSectionChrome>{children}</IntelligenceSectionChrome>
    </div>
  );
}
