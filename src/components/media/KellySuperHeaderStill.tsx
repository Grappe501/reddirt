"use client";

import { useMemo, useState } from "react";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getKellyDashboardHeroCandidates } from "@/lib/campaign-assets";
import { cn } from "@/lib/utils";

/**
 * Public split-hero still: dashboard super header cutout, then JPEG, then the campaign header photo.
 */
export function KellySuperHeaderStill({
  className,
  mediaClassName,
  alt,
}: {
  className?: string;
  mediaClassName?: string;
  alt: string;
}) {
  const srcs = useMemo(() => {
    const chain = getKellyDashboardHeroCandidates().filter((s) => !s.includes("placeholder"));
    return [...new Set([...chain, brandMediaFromLegacySite.statewideBanner])];
  }, []);
  const [index, setIndex] = useState(0);
  const src = srcs[Math.min(index, srcs.length - 1)] ?? srcs[0];

  return (
    <span className={cn("relative block h-full w-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- candidate chain with onError */}
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-contain object-center", mediaClassName)}
        onError={() => setIndex((i) => Math.min(i + 1, srcs.length - 1))}
      />
    </span>
  );
}
