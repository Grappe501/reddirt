"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { STAFF_BACKSTAGE_BLOCKED_QUERY } from "@/lib/intelligence/v4/staffBackstageRouteGuard";
import { STAFF_BACKSTAGE_HUB_HREF } from "@/lib/intelligence/v4/phase15P8StaffBackstage";

export function StaffBackstageBlockedBanner() {
  const params = useSearchParams();
  const blocked = params.get(STAFF_BACKSTAGE_BLOCKED_QUERY);

  if (!blocked) return null;

  return (
    <section className="mb-4 rounded-xl border-2 border-violet-400 bg-violet-50 px-4 py-3 text-xs text-violet-950">
      <p className="font-bold uppercase tracking-wider">Staff backstage — route blocked</p>
      <p className="mt-1 text-kelly-muted">
        <span className="font-mono">{decodeURIComponent(blocked)}</span> is staff-only on your current profile.
        Builder and operations surfaces require <span className="font-bold">NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=STAFF</span>.
      </p>
      <Link href={STAFF_BACKSTAGE_HUB_HREF} className="mt-2 inline-block font-bold text-violet-900 underline">
        Staff backstage inventory →
      </Link>
    </section>
  );
}
