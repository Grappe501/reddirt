import Link from "next/link";

import { GotvPageClient } from "@/components/admin/field-ops/GotvPageClient";
import { loadGotvCommitmentAllocationFile } from "@/lib/field-ops/load-gotv-commitment-allocation";
import { loadStagedGotvCommitmentCards } from "@/lib/field-ops/staged-gotv-cards";

export const dynamic = "force-dynamic";

export default function GotvCommandPage() {
  const allocation = loadGotvCommitmentAllocationFile();
  const stagedCards = loadStagedGotvCommitmentCards();

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/field-ops" className="text-kelly-text underline-offset-2 hover:underline">
          Field ops
        </Link>
        {" · "}
        <span className="text-kelly-text/80">GOTV commitment allocation</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">V3 · GOTV</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">5,000 commitment allocation</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          County-level opt-in commitment capacity, house-party host goals, and compliance-reviewed workload. No
          automated voter targeting and no sends from this page.
        </p>
      </header>

      <GotvPageClient allocation={allocation} stagedCards={stagedCards} />
    </div>
  );
}
