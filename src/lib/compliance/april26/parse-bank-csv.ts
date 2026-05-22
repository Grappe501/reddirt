import { readFile } from "node:fs/promises";
import { parseCsv } from "../imports/csv-column-detector";
import { dollarsToCents, parseEthicsDate } from "./parse-money";

export type BankCsvRow = {
  postedAt: string;
  amountCents: number;
  memo: string;
  checkNumber?: string;
};

export async function parseBankStatementCsv(filePath: string): Promise<BankCsvRow[]> {
  const text = await readFile(filePath, "utf8");
  const parsed = parseCsv(text);
  const rows: BankCsvRow[] = [];
  for (const row of parsed.rows) {
    const date = row.date ?? row.Date ?? row.posted ?? row.Posted;
    const amount = row.amount ?? row.Amount ?? row.credit ?? row.debit;
    if (!date || amount == null || amount === "") continue;
    let amountCents = dollarsToCents(amount);
    if (row.debit && !row.credit) amountCents = -Math.abs(amountCents);
    rows.push({
      postedAt: parseEthicsDate(date),
      amountCents,
      memo: row.memo ?? row.Memo ?? row.description ?? "",
      checkNumber: row.check_number ?? row.check ?? undefined,
    });
  }
  return rows;
}
