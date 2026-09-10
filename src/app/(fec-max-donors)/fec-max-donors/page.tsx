import { loadFecDonorTabs } from "@/lib/fec/arkansas-2026-max-donors";

import { FecMaxDonorsClient } from "./FecMaxDonorsClient";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function FecMaxDonorsPage() {
  const tabs = await loadFecDonorTabs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kelly-text/50">
        Standalone research page · 2026 cycle · RedDirt
      </p>
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-kelly-navy">
        Federal donor lists
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
        Live OpenFEC itemized individual receipts for the 2026 cycle only (January 2025–present).
        Jones, Shoffner, Russell, Ryerse, and Green use a $3,000 threshold. French Hill is a separate
        tab at $2,000. Historical giving is shown in its own column and is not mixed into the 2026
        totals. ActBlue and joint-fundraising memo duplicates are removed. This is public FEC data,
        not a Kelly campaign page.
      </p>
      <div className="mt-8">
        <FecMaxDonorsClient tabs={tabs} />
      </div>
    </main>
  );
}
