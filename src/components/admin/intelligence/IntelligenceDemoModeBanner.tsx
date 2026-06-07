"use client";

import { isIntelligenceDemoMode } from "@/lib/intelligence/v4/intelligenceDemoMode";
import { DEMO_MODE_HUB_HREF } from "@/lib/intelligence/v4/phase15P6DemoMode";
import Link from "next/link";

export function IntelligenceDemoModeBanner() {
  if (!isIntelligenceDemoMode()) return null;

  return (
    <div className="mb-4 rounded-xl border-2 border-teal-400 bg-teal-50 px-4 py-3 text-xs text-teal-950">
      <p className="font-bold uppercase tracking-wider">Purchase demo mode active</p>
      <p className="mt-1 text-kelly-muted">
        Candidate profile surfaces only — run the 15-minute script from the demo hub. Staff infra stays off nav.
      </p>
      <Link
        href={DEMO_MODE_HUB_HREF}
        className="mt-2 inline-block font-bold text-teal-900 underline"
      >
        Open demo script →
      </Link>
    </div>
  );
}
