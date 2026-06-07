"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { resolveStaffBackstageRedirect } from "@/lib/intelligence/v4/staffBackstageRouteGuard";

export function StaffBackstageRouteGuard() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());

  useEffect(() => {
    const redirect = resolveStaffBackstageRedirect(pathname, profile);
    if (redirect) router.replace(redirect);
  }, [pathname, profile, router]);

  return null;
}
