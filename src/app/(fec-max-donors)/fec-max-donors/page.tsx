import {
  ARKANSAS_2026_FEC_CANDIDATES,
  loadArkansas2026MaxDonors,
} from "@/lib/fec/arkansas-2026-max-donors";

import { FecMaxDonorsClient } from "./FecMaxDonorsClient";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function FecMaxDonorsPage() {
  const report = await loadArkansas2026MaxDonors();
  const bothCount = report.donors.filter((donor) => donor.candidateSlugs.length > 1).length;
  const jonesCount = report.donors.filter((donor) => donor.candidateSlugs.includes("chris-jones")).length;
  const shoffnerCount = report.donors.filter((donor) => donor.candidateSlugs.includes("hallie-shoffner")).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kelly-text/50">
        Standalone research page · 2026 cycle · RedDirt
      </p>
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-kelly-navy">
        Federal donors over $3,000
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
        Live OpenFEC itemized individual receipts of $3,000 or more to Chris Jones (AR-02 House) and
        Hallie Shoffner (U.S. Senate). ActBlue memo duplicates are removed. This is public FEC data, not
        a Kelly campaign page.
      </p>

      <ul className="mt-5 flex flex-wrap gap-3 text-sm">
        {ARKANSAS_2026_FEC_CANDIDATES.map((candidate) => (
          <li key={candidate.candidateId}>
            <a
              href={candidate.fecUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-kelly-navy underline underline-offset-2"
            >
              {candidate.label} · {candidate.office}
            </a>
          </li>
        ))}
      </ul>

      {report.missingKey || report.error ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {report.error}
        </p>
      ) : (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Donors</dt>
              <dd className="mt-1 text-2xl font-bold text-kelly-navy">{report.donors.length}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Jones</dt>
              <dd className="mt-1 text-2xl font-bold text-kelly-navy">{jonesCount}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Shoffner</dt>
              <dd className="mt-1 text-2xl font-bold text-kelly-navy">{shoffnerCount}</dd>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Gave to both</dt>
              <dd className="mt-1 text-2xl font-bold text-kelly-navy">{bothCount}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-kelly-text/50">
            {report.giftCount} countable gifts · {money(report.donors.reduce((sum, donor) => sum + donor.total, 0))}{" "}
            combined · refreshed {new Date(report.generatedAt).toLocaleString()} · legal max this cycle is $3,500 per
            election
          </p>
          <div className="mt-6">
            <FecMaxDonorsClient donors={report.donors} />
          </div>
        </>
      )}
    </main>
  );
}
