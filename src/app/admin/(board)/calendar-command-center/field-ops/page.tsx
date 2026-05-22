import Link from "next/link";

import { FieldOpsPageClient } from "@/components/admin/field-ops/FieldOpsPageClient";
import { loadVolunteerCapacityModelFile } from "@/lib/field-ops/load-volunteer-capacity-model";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function FieldOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const model = loadVolunteerCapacityModelFile();

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/kelly" className="text-kelly-text underline-offset-2 hover:underline">
          Kelly cockpit
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Field operations</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">V3 · Field ops</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Volunteer capacity & community coverage</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          Logistics, accessibility, and volunteer workload — not automated voter persuasion. Refresh JSON after running{" "}
          <code className="rounded bg-white/80 px-1">npm run fieldops:volunteer-capacity:build</code>.
        </p>
      </header>

      <FieldOpsPageClient model={model} initialTab={sp.tab} />
    </div>
  );
}
