"use client";

import { usePathname } from "next/navigation";
import { useOutboundClicks, usePageTiming, usePageView, usePublicCtaCapture, useScrollDepth } from "@/lib/analytics/track";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  usePageView(pathname);
  usePublicCtaCapture();
  useScrollDepth(pathname);
  useOutboundClicks();
  usePageTiming(pathname);
  return children;
}
