"use client";

import { usePathname } from "next/navigation";
import { usePageView, usePublicCtaCapture } from "@/lib/analytics/track";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  usePageView(pathname);
  usePublicCtaCapture();
  return children;
}
