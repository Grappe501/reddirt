"use client";

import { useMemo, useState } from "react";

import type { FecDonorTabId, FecDonorTabView, MaxDonor } from "@/lib/fec/arkansas-2026-max-donors";

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function csvEscape(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(donors: MaxDonor[], filename: string) {
  const header = [
    "Name",
    "City",
    "State",
    "Employer",
    "Occupation",
    "Total",
    "Gifts",
    "Candidates",
    "Last date",
  ];
  const lines = [
    header.join(","),
    ...donors.map((donor) =>
      [
        csvEscape(donor.name),
        csvEscape(donor.city),
        csvEscape(donor.state),
        csvEscape(donor.employer),
        csvEscape(donor.occupation),
        csvEscape(donor.total),
        csvEscape(donor.giftCount),
        csvEscape(donor.gifts.map((gift) => gift.candidateLabel).filter((v, i, a) => a.indexOf(v) === i).join(" + ")),
        csvEscape(donor.lastDate),
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function DonorTable({
  tab,
  donors,
  csvName,
}: {
  tab: FecDonorTabView;
  donors: MaxDonor[];
  csvName: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const showFilters = tab.candidates.length > 1;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return donors.filter((donor) => {
      if (filter === "multi" && donor.candidateSlugs.length < 2) return false;
      if (filter !== "all" && filter !== "multi" && !donor.candidateSlugs.includes(filter)) return false;
      if (!q) return true;
      const hay = [donor.name, donor.city, donor.state, donor.employer, donor.occupation]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [donors, filter, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-kelly-text/55">
            Search the list
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, city, employer…"
            className="w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 text-sm text-kelly-text outline-none ring-kelly-navy/30 focus:ring-2"
          />
        </label>
        <button
          type="button"
          onClick={() => downloadCsv(visible, csvName)}
          className="rounded-lg bg-kelly-navy px-4 py-2 text-sm font-semibold text-white hover:bg-kelly-slate"
        >
          Download CSV
        </button>
      </div>

      {showFilters ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === "all"
                ? "bg-kelly-navy text-white"
                : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
            }`}
          >
            All donors
          </button>
          {tab.candidates.map((candidate) => (
            <button
              key={candidate.slug}
              type="button"
              onClick={() => setFilter(candidate.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === candidate.slug
                  ? "bg-kelly-navy text-white"
                  : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
              }`}
            >
              {candidate.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilter("multi")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === "multi"
                ? "bg-kelly-navy text-white"
                : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
            }`}
          >
            Gave to more than one
          </button>
          <p className="self-center text-xs text-kelly-text/55">{visible.length} shown</p>
        </div>
      ) : (
        <p className="text-xs text-kelly-text/55">{visible.length} shown</p>
      )}

      <div className="overflow-hidden rounded-xl border border-kelly-text/10 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-kelly-navy text-white">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Donor</th>
              <th className="px-3 py-2.5 font-semibold">City</th>
              <th className="px-3 py-2.5 font-semibold">Employer</th>
              <th className="px-3 py-2.5 font-semibold">Candidate</th>
              <th className="px-3 py-2.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-kelly-text/60">
                  No donors at this threshold in the current FEC filings.
                </td>
              </tr>
            ) : (
              visible.map((donor) => {
                const open = openKey === donor.key;
                const candidates = donor.gifts
                  .map((gift) => gift.candidateLabel)
                  .filter((label, index, all) => all.indexOf(label) === index)
                  .join(" + ");
                return (
                  <tr key={donor.key} className="border-t border-kelly-text/10 align-top">
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setOpenKey(open ? null : donor.key)}
                        className="text-left font-semibold text-kelly-navy hover:underline"
                      >
                        {donor.name}
                      </button>
                      {donor.occupation ? (
                        <p className="text-xs text-kelly-text/55">{donor.occupation}</p>
                      ) : null}
                      {open ? (
                        <ul className="mt-2 space-y-1 text-xs text-kelly-text/70">
                          {donor.gifts.map((gift, index) => (
                            <li key={`${gift.date}-${gift.amount}-${index}`}>
                              {gift.date || "undated"} · {money(gift.amount)} · {gift.election || "election n/a"} ·{" "}
                              {gift.candidateLabel}
                              {gift.filingUrl ? (
                                <>
                                  {" "}
                                  ·{" "}
                                  <a
                                    href={gift.filingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2"
                                  >
                                    FEC image
                                  </a>
                                </>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-kelly-text/80">
                      {[donor.city, donor.state].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-3 py-2.5 text-kelly-text/80">{donor.employer || "—"}</td>
                    <td className="px-3 py-2.5 text-kelly-text/80">{candidates}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{money(donor.total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabStats({ tab }: { tab: FecDonorTabView }) {
  const { report } = tab;
  const multiCount = report.donors.filter((donor) => donor.candidateSlugs.length > 1).length;

  return (
    <>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Donors</dt>
          <dd className="mt-1 text-2xl font-bold text-kelly-navy">{report.donors.length}</dd>
        </div>
        {tab.candidates.map((candidate) => (
          <div key={candidate.slug} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-kelly-text/50">{candidate.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-kelly-navy">
              {report.donors.filter((donor) => donor.candidateSlugs.includes(candidate.slug)).length}
            </dd>
          </div>
        ))}
        {tab.candidates.length > 1 ? (
          <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-kelly-text/50">Gave to more than one</dt>
            <dd className="mt-1 text-2xl font-bold text-kelly-navy">{multiCount}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-kelly-text/50">
        {report.giftCount} countable gifts of {money(tab.minAmount)} or more ·{" "}
        {money(report.donors.reduce((sum, donor) => sum + donor.total, 0))} combined · refreshed{" "}
        {new Date(report.generatedAt).toLocaleString()}
      </p>
    </>
  );
}

export function FecMaxDonorsClient({ tabs }: { tabs: FecDonorTabView[] }) {
  const [tabId, setTabId] = useState<FecDonorTabId>(tabs[0]?.id ?? "jones-shoffner");
  const tab = tabs.find((item) => item.id === tabId) ?? tabs[0];
  if (!tab) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-kelly-text/10 pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTabId(item.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              item.id === tab.id
                ? "bg-kelly-navy text-white"
                : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
            }`}
          >
            {item.label}
            <span className="ml-2 text-xs font-normal opacity-80">
              {money(item.minAmount)}+
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-3 text-sm">
        {tab.candidates.map((candidate) => (
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

      {tab.report.missingKey || tab.report.error ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {tab.report.error}
        </p>
      ) : (
        <>
          <TabStats tab={tab} />
          <div className="mt-6">
            <DonorTable
              key={tab.id}
              tab={tab}
              donors={tab.report.donors}
              csvName={`fec-donors-${tab.id}-2026.csv`}
            />
          </div>
        </>
      )}
    </div>
  );
}
