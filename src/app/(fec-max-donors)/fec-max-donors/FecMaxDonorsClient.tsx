"use client";

import { useMemo, useState } from "react";

import type { FecDonorTabView, MaxDonor } from "@/lib/fec/arkansas-2026-max-donors";
import { NET_WORTH_REPORT } from "@/lib/fec/net-worth-track";

type DonorView = {
  id: string;
  label: string;
  minAmount: number;
  tab: FecDonorTabView;
  slug: string | null;
};

function buildDonorViews(tabs: FecDonorTabView[]): DonorView[] {
  const views: DonorView[] = [];
  for (const tab of tabs) {
    if (tab.id === "jones-shoffner") {
      for (const candidate of tab.candidates) {
        views.push({ id: candidate.slug, label: candidate.label, minAmount: tab.minAmount, tab, slug: candidate.slug });
      }
    }
    views.push({ id: tab.id, label: tab.label, minAmount: tab.minAmount, tab, slug: null });
  }
  return views;
}

function scopeDonor(donor: MaxDonor, slug: string | null): MaxDonor {
  if (!slug) return donor;
  const gifts = donor.gifts.filter((gift) => gift.candidateSlug === slug);
  const historicalGifts = donor.historicalGifts.filter((gift) => gift.candidateSlug === slug);
  return {
    ...donor,
    gifts,
    historicalGifts,
    giftCount: gifts.length,
    total: gifts.reduce((sum, gift) => sum + gift.amount, 0),
    historicalTotal: historicalGifts.reduce((sum, gift) => sum + gift.amount, 0),
    candidateSlugs: [slug],
  };
}

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
    "2026 cycle",
    "Historical",
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
        csvEscape(donor.historicalTotal),
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
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-kelly-navy text-white">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Donor</th>
              <th className="px-3 py-2.5 font-semibold">City</th>
              <th className="px-3 py-2.5 font-semibold">Employer</th>
              <th className="px-3 py-2.5 font-semibold">Candidate</th>
              <th className="px-3 py-2.5 text-right font-semibold">2026 cycle</th>
              <th className="px-3 py-2.5 text-right font-semibold">Historical</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-kelly-text/60">
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
                        <div className="mt-2 space-y-2 text-xs text-kelly-text/70">
                          <p className="font-semibold uppercase tracking-wide text-kelly-text/50">2026 cycle</p>
                          <ul className="space-y-1">
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
                          {donor.historicalGifts.length > 0 ? (
                            <>
                              <p className="font-semibold uppercase tracking-wide text-kelly-text/50">
                                Earlier cycles
                              </p>
                              <ul className="space-y-1">
                                {donor.historicalGifts.map((gift, index) => (
                                  <li key={`hist-${gift.date}-${gift.amount}-${index}`}>
                                    {gift.date || "undated"} · {money(gift.amount)} · {gift.election || "election n/a"}{" "}
                                    · {gift.candidateLabel}
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
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-kelly-text/80">
                      {[donor.city, donor.state].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-3 py-2.5 text-kelly-text/80">{donor.employer || "—"}</td>
                    <td className="px-3 py-2.5 text-kelly-text/80">{candidates}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{money(donor.total)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-kelly-text/80">
                      {donor.historicalTotal > 0 ? money(donor.historicalTotal) : "—"}
                    </td>
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
        {report.giftCount} countable 2026-cycle gifts of {money(tab.minAmount)} or more ·{" "}
        {money(report.donors.reduce((sum, donor) => sum + donor.total, 0))} combined this cycle ·
        refreshed {new Date(report.generatedAt).toLocaleString()}
      </p>
    </>
  );
}

function compactMoney(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "–" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function NetWorthPanel() {
  const [personId, setPersonId] = useState(NET_WORTH_REPORT.people[0]?.id ?? "french-hill");
  const person = NET_WORTH_REPORT.people.find((item) => item.id === personId) ?? NET_WORTH_REPORT.people[0];
  if (!person) return null;
  const comparable = person.rows.filter((row) => row.series === "opensecrets" && row.midpoint != null);
  const max = Math.max(...comparable.map((row) => Math.abs(row.midpoint ?? 0)), 1);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-kelly-text/10 pb-3">
        {NET_WORTH_REPORT.people.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPersonId(item.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              item.id === person.id
                ? "bg-kelly-navy text-white"
                : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:border-kelly-navy/30"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm text-kelly-text/70">
        {person.office} · in office since {person.inOfficeSince}. {person.beforeNote}
      </p>
      <ul className="mt-3 flex flex-wrap gap-3 text-sm">
        {person.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy underline underline-offset-2">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {person.highlights.map((item) => (
          <div key={item.label} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-kelly-text/50">{item.label}</dt>
            <dd className="mt-1 text-lg font-bold text-kelly-navy">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-kelly-text/55">{NET_WORTH_REPORT.disclaimer}</p>
      <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-kelly-text/50">Before taking office</h2>
      <div className="mt-3 space-y-3">
        {person.preOffice.map((item) => (
          <article key={`${item.year}-${item.item}`} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-kelly-navy">
              {item.year} · {item.item}
            </h3>
            <p className="mt-1 text-sm text-kelly-text/70">
              {item.detail}{" "}
              <a href={item.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {item.source}
              </a>
            </p>
          </article>
        ))}
      </div>
      {comparable.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-kelly-text/50">
            OpenSecrets midpoints only
          </h2>
          <div className="mt-3 space-y-2">
            {comparable.map((row) => {
              const width = Math.max(4, Math.round((Math.abs(row.midpoint ?? 0) / max) * 100));
              return (
                <div key={row.year} className="grid grid-cols-[70px_1fr_90px] items-center gap-3 text-xs text-kelly-text/60">
                  <span>{row.year}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e6dfd2]">
                    <div className="h-full bg-kelly-navy" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-right tabular-nums">{compactMoney(row.midpoint ?? 0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="mt-6 overflow-hidden rounded-xl border border-kelly-text/10 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-kelly-navy text-white">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Year</th>
              <th className="px-3 py-2.5 font-semibold">Period</th>
              <th className="px-3 py-2.5 font-semibold">Estimate</th>
              <th className="px-3 py-2.5 font-semibold">Range</th>
              <th className="px-3 py-2.5 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {person.rows.map((row) => (
              <tr key={`${row.year}-${row.estimate}`} className="border-t border-kelly-text/10 align-top">
                <td className="px-3 py-2.5">{row.year}</td>
                <td className="px-3 py-2.5 text-kelly-text/80">{row.period}</td>
                <td className="px-3 py-2.5 font-semibold">{row.estimate}</td>
                <td className="px-3 py-2.5 text-kelly-text/80">{row.range}</td>
                <td className="px-3 py-2.5">
                  <a href={row.href} target="_blank" rel="noreferrer" className="text-kelly-navy underline underline-offset-2">
                    {row.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FecMaxDonorsClient({ tabs }: { tabs: FecDonorTabView[] }) {
  const views = useMemo(() => buildDonorViews(tabs), [tabs]);
  const [section, setSection] = useState<"donors" | "net-worth">("donors");
  const [viewId, setViewId] = useState(views[0]?.id ?? "chris-jones");
  const view = views.find((item) => item.id === viewId) ?? views[0];
  if (!view) return null;
  const tab = view.tab;
  const scopedDonors = tab.report.donors
    .filter((donor) => !view.slug || donor.candidateSlugs.includes(view.slug))
    .map((donor) => scopeDonor(donor, view.slug));
  const scopedTab: FecDonorTabView = view.slug
    ? { ...tab, candidates: tab.candidates.filter((candidate) => candidate.slug === view.slug) }
    : tab;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSection("donors")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            section === "donors" ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-white text-kelly-text/80"
          }`}
        >
          Donors
        </button>
        <button
          type="button"
          onClick={() => setSection("net-worth")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            section === "net-worth" ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-white text-kelly-text/80"
          }`}
        >
          Net worth
        </button>
      </div>
      {section === "net-worth" ? <NetWorthPanel /> : null}
      {section === "donors" ? (
        <>
      <div className="flex flex-wrap gap-2 border-b border-kelly-text/10 pb-3">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setViewId(item.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              item.id === view.id
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
        {scopedTab.candidates.map((candidate) => (
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
          <TabStats
            tab={{
              ...scopedTab,
              report: {
                ...tab.report,
                donors: scopedDonors,
                giftCount: scopedDonors.reduce((sum, donor) => sum + donor.giftCount, 0),
              },
            }}
          />
          <div className="mt-6">
            <DonorTable
              key={view.id}
              tab={scopedTab}
              donors={scopedDonors}
              csvName={`fec-donors-${view.id}-2026.csv`}
            />
          </div>
        </>
      )}
        </>
      ) : null}
    </div>
  );
}
