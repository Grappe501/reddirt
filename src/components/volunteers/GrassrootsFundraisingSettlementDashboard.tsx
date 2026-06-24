import Link from "next/link";

import type { GrassrootsFundraisingSettlementPayload } from "@/lib/volunteers/load-grassroots-fundraising-settlement-dashboard";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function tierLabel(tier: string | null): string {
  if (tier === "grassroots_fundraising_lead") return "Lead · 15%";
  if (tier === "field_fundraiser") return "Field · 10%";
  return "Unmatched";
}

type Props = {
  payload: GrassrootsFundraisingSettlementPayload;
  selectedGiftId?: string;
};

export function GrassrootsFundraisingSettlementDashboard({ payload, selectedGiftId }: Props) {
  const selected = payload.gifts.find((g) => g.id === selectedGiftId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Internal only.</strong> {payload.legalBanner}
        </div>

        {!payload.stats.goodChangeAvailable && payload.stats.stagingGiftCount === 0 ? (
          <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/50 px-4 py-3 text-sm text-[var(--ep-navy-muted)]">
            No GoodChange CSV loaded yet — attribution queue empty until compliance import syncs. Commission registry
            and tracked-link keys still load from roster.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Commission leads</p>
            <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{payload.stats.commissionLeads}</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{payload.stats.openLeadSlots} open slots</p>
          </div>
          <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Attributed gifts</p>
            <p className="mt-2 font-heading text-3xl font-bold text-emerald-800">{payload.stats.attributedGifts}</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{payload.stats.unmatchedGifts} unmatched</p>
          </div>
          <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Net attributed</p>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">
              {formatMoney(payload.stats.totalNetCents)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Commission calc</p>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">
              {formatMoney(payload.stats.totalDirectCommissionCents + payload.stats.totalOverrideCommissionCents)}
            </p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              Direct {formatMoney(payload.stats.totalDirectCommissionCents)} · Override{" "}
              {formatMoney(payload.stats.totalOverrideCommissionCents)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--ep-navy-muted)]">
          <p>
            Lead direct:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">
              {payload.config.grassrootsFundraisingLeadDirectPercent}%
            </span>
          </p>
          <p>
            Downline override:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">
              {payload.config.grassrootsFundraisingLeadDownlineOverridePercent}%
            </span>
          </p>
          <p>
            Field fundraiser:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">
              {payload.config.defaultFieldFundraiserDirectPercent}%
            </span>
          </p>
        </div>

        <section>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Commission registry</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            QR / weblink attribution keys tied to leader initials — campus co-chairs and field leads.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Leader</th>
                  <th className="px-4 py-3 font-semibold">Attribution key</th>
                  <th className="px-4 py-3 font-semibold">Tier</th>
                  <th className="px-4 py-3 font-semibold">Campus</th>
                  <th className="px-4 py-3 font-semibold">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.commissionLeads.map((lead) => (
                  <tr key={lead.slug} className="hover:bg-[var(--ep-cream)]/30">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                          lead.isOpenSlot
                            ? "bg-red-50 text-red-950 ring-red-200"
                            : "bg-emerald-50 text-emerald-950 ring-emerald-200"
                        }`}
                      >
                        {lead.isOpenSlot ? "Open" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={lead.leaderWorkbenchHref}
                        className="font-semibold text-[var(--ep-navy)] hover:underline"
                      >
                        {lead.displayName}
                      </Link>
                      <p className="font-mono text-xs text-[var(--ep-blue)]">{lead.initials}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--ep-navy)]">{lead.attributionKey}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                      {lead.directPercent}%
                      {lead.downlineOverridePercent ? ` · +${lead.downlineOverridePercent}% override` : ""}
                    </td>
                    <td className="px-4 py-3 text-[var(--ep-navy-muted)]">{lead.campusLabel ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {lead.workbenchHref ? (
                        <Link href={lead.workbenchHref} className="font-semibold text-[var(--ep-blue)] hover:underline">
                          Campus WB →
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {payload.rollups.length ? (
          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Settlement rollup</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              Direct and downline override totals — pending treasurer approval before any payout.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Leader</th>
                    <th className="px-4 py-3 font-semibold">Direct gifts</th>
                    <th className="px-4 py-3 font-semibold">Direct commission</th>
                    <th className="px-4 py-3 font-semibold">Override gifts</th>
                    <th className="px-4 py-3 font-semibold">Override commission</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ep-navy)]/10">
                  {payload.rollups.map((row) => (
                    <tr key={row.leaderSlug} className="hover:bg-[var(--ep-cream)]/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/election-plan/operators/leaders/${row.leaderSlug}`}
                          className="font-semibold text-[var(--ep-navy)] hover:underline"
                        >
                          {row.displayName}
                        </Link>
                        <p className="font-mono text-xs text-[var(--ep-blue)]">{row.initials}</p>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">{row.directGiftCount}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-[var(--ep-navy)]">
                        {formatMoney(row.directCommissionCents)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">{row.overrideGiftCount}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">
                        {formatMoney(row.overrideCommissionCents)}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-bold text-[var(--ep-navy)]">
                        {formatMoney(row.totalCommissionCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Attribution queue</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            GoodChange fundraiser column matched to roster attribution keys — click a row for detail.
          </p>
          {payload.gifts.length ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Attribution</th>
                    <th className="px-4 py-3 font-semibold">Leader</th>
                    <th className="px-4 py-3 font-semibold">Net</th>
                    <th className="px-4 py-3 font-semibold">Direct</th>
                    <th className="px-4 py-3 font-semibold">Upline override</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ep-navy)]/10">
                  {payload.gifts.slice(0, 40).map((gift) => (
                    <tr key={gift.id} className="hover:bg-[var(--ep-cream)]/30">
                      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{formatWhen(gift.receivedAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/election-plan/operators/grassroots-fundraising-settlement?gift=${gift.id}`}
                          className="font-mono text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                        >
                          {gift.attributionKey}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--ep-navy)]">{gift.leaderName ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy)]">{formatMoney(gift.netCents)}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">
                        {gift.directCommissionCents ? formatMoney(gift.directCommissionCents) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                        {gift.uplineLeaderName
                          ? `${gift.uplineLeaderName} · ${formatMoney(gift.uplineCommissionCents)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                        {gift.source}
                        {gift.matchStatus === "unmatched" ? " · unmatched" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/50 px-4 py-3 text-sm text-[var(--ep-navy-muted)]">
              No attributed gifts in queue — import GoodChange CSV or add operator staging rows.
            </p>
          )}
        </section>

        {selected ? (
          <section className="rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Gift detail</p>
            <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
              Attribution · {selected.attributionKey}
            </h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Leader</dt>
                <dd className="font-semibold text-[var(--ep-navy)]">{selected.leaderName ?? "Unmatched"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Tier</dt>
                <dd>{tierLabel(selected.tier)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Gross / net</dt>
                <dd className="tabular-nums">
                  {formatMoney(selected.grossCents)} / {formatMoney(selected.netCents)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Direct commission</dt>
                <dd className="tabular-nums font-semibold">{formatMoney(selected.directCommissionCents)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Upline override</dt>
                <dd>
                  {selected.uplineLeaderName
                    ? `${selected.uplineLeaderName} · ${formatMoney(selected.uplineCommissionCents)}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--ep-navy-muted)]">Payout batch</dt>
                <dd>{selected.payoutId ?? "—"}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {payload.unmatchedGifts.length ? (
          <section>
            <h2 className="font-heading text-lg font-bold text-red-900">Unmatched attribution</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              Fundraiser codes with no roster match — fix tracked links before settlement.
            </p>
            <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-red-200 bg-red-50/50 shadow-sm">
              {payload.unmatchedGifts.map((gift) => (
                <li key={gift.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-mono font-semibold text-red-950">{gift.attributionKey}</span>
                  <span className="tabular-nums text-[var(--ep-navy-muted)]">{formatMoney(gift.netCents)} net</span>
                  <span className="text-xs text-[var(--ep-navy-muted)]">{formatWhen(gift.receivedAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="border-t border-[var(--ep-navy)]/10 pt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly settlement rhythm</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {payload.weeklyRhythm.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                {item.href ? (
                  <Link href={item.href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {item.label} →
                  </Link>
                ) : (
                  <p className="font-semibold text-[var(--ep-navy)]">{item.label}</p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
