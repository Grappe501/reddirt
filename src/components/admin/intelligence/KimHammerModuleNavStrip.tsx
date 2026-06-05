"use client";

import { usePathname } from "next/navigation";
import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";

/** Compact Tier-3 module strip — active route from pathname. */
export function KimHammerModuleNavStrip() {
  const pathname = usePathname() ?? "";
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return <KimHammerModuleNavPanel compact activeHref={path} />;
}
