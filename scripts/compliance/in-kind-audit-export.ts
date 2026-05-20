import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadOzarkForwardAuctionDonations, ozarkAuctionRowsToCsv } from "../../src/lib/compliance/in-kind/ozark-forward-auction-donations";
import { APRIL_AUDIT_MAIN_COLUMNS, rowsToCsv } from "../../src/lib/compliance/audit/april-audit-csv";

async function main() {
  const { rows } = await loadOzarkForwardAuctionDonations();
  const auditDir = path.join(process.cwd(), "docs", "compliance", "audit");
  await mkdir(auditDir, { recursive: true });
  const out = path.join(auditDir, "april-2026-in-kind-auction.csv");
  const mainRows = rows.map((r) => ({
    audit_id: `IK-${r.itemNumber}`,
    workflow_area: "in_kind",
    record_type: "auction_donation_line",
    source_file: r.sourceImage,
    source_route: "/admin/compliance/in-kind/ozark-auction",
    payee_or_vendor: r.donorName,
    amount: r.estimatedValueUsd,
    description: r.itemTitle,
    human_answer: "",
    operator_notes: [r.statusNotes, r.itemDescription].filter(Boolean).join(" · "),
    ready_for_import: "pending_review",
    ready_for_filing: "no",
  }));
  await writeFile(out, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, mainRows), "utf8");
  await writeFile(path.join(auditDir, "april-2026-in-kind-auction-ozark-only.csv"), ozarkAuctionRowsToCsv(rows), "utf8");
  console.log(JSON.stringify({ status: "ok", rows: rows.length, csv: out }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
