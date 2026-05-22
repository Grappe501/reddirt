import type { ContributionDraft, GoodChangeRow, MappedGoodChangeContribution } from "./types";
import { dollarsToCents, parseGoodChangeDate } from "./parse-money";

function str(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value).trim() || null;
}

export function formatContributorName(draft: Pick<ContributionDraft, "firstName" | "lastName">): string {
  return [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim();
}

export function mapGoodChangeRowToContribution(row: GoodChangeRow): MappedGoodChangeContribution {
  const grossCents = dollarsToCents(row.amount);
  const feeCents = dollarsToCents(row.facilitator_fee);
  const netCents = dollarsToCents(row.net);
  const anon = String(row.anon).toLowerCase() === "true";
  const draft: ContributionDraft = {
    contributorType: "INDIVIDUAL",
    firstName: anon ? null : str(row.first_name),
    lastName: anon ? null : str(row.last_name),
    email: anon ? null : str(row.email),
    phone: anon ? null : str(row.phone),
    address1: str(row.billing_line_1),
    address2: str(row.billing_line_2),
    city: str(row.billing_city),
    state: str(row.billing_state),
    zip: str(row.billing_zip),
    employer: str(row.employer_name),
    occupation: str(row.employer_occupation),
    amountCents: grossCents,
    receivedAt: parseGoodChangeDate(row.created_on),
    paymentMethod: "CARD",
    isInKind: false,
    isRefund: false,
    memo: [row.fundraiser, row.type, row.payout].filter(Boolean).join(" · "),
  };
  return {
    ...draft,
    sourceTransferId: row.transfer_id,
    payoutId: row.payout,
    grossCents,
    feeCents,
    netCents,
  };
}

export function contributionChunkText(row: MappedGoodChangeContribution, contributorName: string): string {
  return [
    `April 2026 GoodChange contribution`,
    `Transfer ID: ${row.sourceTransferId}`,
    `Payout batch: ${row.payoutId}`,
    `Date: ${row.receivedAt}`,
    `Donor: ${contributorName || "anonymous"}`,
    `Gross: $${(row.grossCents / 100).toFixed(2)} · Fee: $${(row.feeCents / 100).toFixed(2)} · Net: $${(row.netCents / 100).toFixed(2)}`,
    `Employer/occupation: ${row.employer || "—"} / ${row.occupation || "—"}`,
    `Memo: ${row.memo || ""}`,
    `SOS mapping: payment_method=CARD, amount=reported gross, reconcile net deposit to bank via payout ID.`,
  ].join("\n");
}
