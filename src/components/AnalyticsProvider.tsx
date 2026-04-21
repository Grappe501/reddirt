"use client";

import { usePathname } from "next/navigation";
import { usePageView } from "@/lib/analytics/track";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  usePageView(pathname);
  return children;
}
