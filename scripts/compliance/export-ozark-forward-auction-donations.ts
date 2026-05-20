/**
 * Export Ozark Forward Auction donation list (3 April26 JPG pages) to CSV for download.
 *
 * Usage:
 *   COMPLIANCE_APRIL26_DIR=H:\SOSWebsite\Compliance\April26 npm run compliance:export-ozark-auction-donations
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  loadOzarkForwardAuctionDonations,
  OZARK_AUCTION_CSV_NAME,
  ozarkAuctionRowsToCsv,
} from "@/lib/compliance/in-kind/ozark-forward-auction-donations";

async function main() {
  const { rows, csvPath: outPath } = await loadOzarkForwardAuctionDonations();
  if (!rows.length) {
    console.error(JSON.stringify({ status: "error", message: "No rows — restore CSV under April26 or re-seed data." }, null, 2));
    process.exit(1);
  }
  const csv = ozarkAuctionRowsToCsv(rows);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, csv, "utf8");

  const totalValue = rows.reduce((sum, r) => sum + r.estimatedValueUsd, 0);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        rows: rows.length,
        totalEstimatedValueUsd: totalValue,
        csv: outPath,
        sourceImages: [
          "att.EakxU1jYtX133ku7f1haPlwKIeW1uh5D0_jy_qCfwKM.jpg",
          "att.RABoBz2uoaeAo8ruzwIHQJClwu2hdMHjyhh1XTFt44s.jpg",
          "att.JT8KlqSSQyejhBqimYNRHyp-Nvsv2y9zWP9X0UezblE.jpg",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
