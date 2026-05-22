import { readFile } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir } from "../approval/april26-source";

export type OzarkAuctionRow = {
  sourceImage: string;
  itemNumber: string;
  donorName: string;
  phone: string;
  email: string;
  address: string;
  itemTitle: string;
  estimatedValueUsd: number;
  statusNotes: string;
  itemDescription: string;
};

export const OZARK_AUCTION_CSV_NAME = "ozark-forward-auction-donations-2026.csv";

/** Parse a single CSV line respecting quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function ozarkAuctionRowsToCsv(rows: OzarkAuctionRow[]): string {
  const headers = [
    "campaign_event",
    "source_image",
    "item_number",
    "donor_name",
    "phone",
    "email",
    "address",
    "item_title",
    "estimated_value_usd",
    "status_notes",
    "item_description",
  ];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) =>
      [
        "Ozark Forward Auction Donations for Kelly Grappe Campaign — 2026",
        r.sourceImage,
        r.itemNumber,
        r.donorName,
        r.phone,
        r.email,
        r.address,
        r.itemTitle,
        r.estimatedValueUsd,
        r.statusNotes,
        r.itemDescription,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\r\n");
}

export function parseOzarkAuctionCsv(text: string): OzarkAuctionRow[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const c = parseCsvLine(line);
    return {
      sourceImage: c[1] ?? "",
      itemNumber: c[2] ?? "",
      donorName: c[3] ?? "",
      phone: c[4] ?? "",
      email: c[5] ?? "",
      address: c[6] ?? "",
      itemTitle: c[7] ?? "",
      estimatedValueUsd: Number(c[8]) || 0,
      statusNotes: c[9] ?? "",
      itemDescription: c[10] ?? "",
    };
  });
}

export function getOzarkAuctionCsvPath(): string {
  return path.join(getApril26Dir(), OZARK_AUCTION_CSV_NAME);
}

export async function loadOzarkForwardAuctionDonations(): Promise<{
  rows: OzarkAuctionRow[];
  csvPath: string;
  fromDisk: boolean;
}> {
  const csvPath = getOzarkAuctionCsvPath();
  try {
    const text = await readFile(csvPath, "utf8");
    return { rows: parseOzarkAuctionCsv(text), csvPath, fromDisk: true };
  } catch {
    return { rows: [], csvPath, fromDisk: false };
  }
}
