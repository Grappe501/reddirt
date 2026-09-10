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
        Donor tabs use live OpenFEC itemized receipts for the 2026 cycle only. The Net worth tab
        tracks French Hill and Tom Cotton from published disclosures, including pre-office filings.
        Those figures are ranges and estimates, not official exact net worth. This is public FEC
        and House/Senate disclosure data, not a Kelly campaign page.
      </p>
      <div className="mt-8">
        <FecMaxDonorsClient tabs={tabs} />
      </div>
    </main>
  );
}
