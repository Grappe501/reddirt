"use client";

import { useMemo, useState } from "react";

import type { ArkansasFecCandidateSlug, MaxDonor } from "@/lib/fec/arkansas-2026-max-donors";

const FILTERS: Array<{ id: "all" | ArkansasFecCandidateSlug | "both"; label: string }> = [
  { id: "all", label: "All donors" },
  { id: "chris-jones", label: "Chris Jones" },
  { id: "hallie-shoffner", label: "Hallie Shoffner" },
  { id: "both", label: "Gave to both" },
];

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function csvEscape(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(donors: MaxDonor[]) {
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
  link.download = "fec-max-donors-arkansas-2026.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function FecMaxDonorsClient({ donors }: { donors: MaxDonor[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return donors.filter((donor) => {
      if (filter === "both" && donor.candidateSlugs.length < 2) return false;
      if (filter !== "all" && filter !== "both" && !donor.candidateSlugs.includes(filter)) return false;
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
          onClick={() => downloadCsv(visible)}
          className="rounded-lg bg-kelly-navy px-4 py-2 text-sm font-semibold text-white hover:bg-kelly-slate"
        >
          Download CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === item.id
                ? "bg-kelly-navy text-white"
                : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
            }`}
          >
            {item.label}
          </button>
        ))}
        <p className="self-center text-xs text-kelly-text/55">{visible.length} shown</p>
      </div>

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
                  No donors match this search.
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
