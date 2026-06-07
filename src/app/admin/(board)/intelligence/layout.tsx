import type { ReactNode } from "react";
import { Suspense } from "react";
import { IntelligenceSectionChrome } from "@/components/admin/intelligence/IntelligenceSectionChrome";
import { StaffBackstageRouteGuard } from "@/components/admin/intelligence/StaffBackstageRouteGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function IntelligenceSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <StaffBackstageRouteGuard />
      <IntelligenceSectionChrome>{children}</IntelligenceSectionChrome>
    </div>
  );
}
