"use client";

import { useState } from "react";

/**
 * Small approved Kelly cutout for in-page accents only (not a second header).
 * Hides if the asset path 404s until HQ uploads the PNG.
 */
export function KellyAccentCutout({
  src,
  alt = "Kelly Grappe",
  className = "",
}: {
  src: string;
  alt?: string;
  /** Optional wrapper classes (width constraints, etc.) */
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div className={`flex justify-end ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- lightweight accent; hide on error */}
      <img
        src={src}
        alt={alt}
        width={140}
        height={168}
        className="max-h-[7.5rem] w-auto max-w-[130px] rounded-lg object-contain opacity-[0.92] shadow-[0_6px_20px_-4px_rgba(15,30,60,0.22)] sm:max-h-[8.25rem] sm:max-w-[140px]"
        loading="lazy"
        onError={() => setOk(false)}
      />
    </div>
  );
}
