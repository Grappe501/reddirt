"use client";

import { useId, type SVGProps } from "react";

/**
 * Small circular campaign mark for the header — ballot + check, civic midnight / gold.
 * Uses CSS variables from globals.css so it stays on-brand in light or dark shells.
 */
export function HeaderRoundLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  const gradId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="24" y1="5" x2="24" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--kelly-slate)" />
          <stop offset={1} stopColor="var(--kelly-deep)" />
        </linearGradient>
      </defs>
      <circle cx={24} cy={24} r={22.25} fill={`url(#${gradId})`} stroke="var(--kelly-gold)" strokeWidth={1.35} />
      <path
        d="M16 13.5h16a2.25 2.25 0 012.25 2.25v16.5A2.25 2.25 0 0132 34.5H16a2.25 2.25 0 01-2.25-2.25v-16.5A2.25 2.25 0 0116 13.5z"
        fill="var(--kelly-navy)"
        stroke="var(--kelly-gold-soft)"
        strokeWidth={0.85}
        opacity={0.92}
      />
      <path
        d="M18.25 23.75l4.35 4.35 9.15-10.35"
        stroke="var(--kelly-gold)"
        strokeWidth={2.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={33.5} cy={13.25} r={1.65} fill="var(--kelly-gold-soft)" />
    </svg>
  );
}
