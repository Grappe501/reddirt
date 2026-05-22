export function dollarsToCents(input: string | number | undefined | null): number {
  if (input == null || input === "") return 0;
  if (typeof input === "number") return Math.round(input * 100);
  const cleaned = String(input).replace(/[^0-9.-]/g, "");
  if (!cleaned) return 0;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function parseEthicsDate(input: string | number | undefined | null): string {
  if (input == null || input === "") return "2026-04-01";
  if (typeof input === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + input * 86400000);
    return date.toISOString().slice(0, 10);
  }
  const text = String(input).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (us) {
    const year = us[3].length === 2 ? `20${us[3]}` : us[3];
    return `${year}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return "2026-04-01";
}

export function parseGoodChangeDate(createdOn: string | number): string {
  if (typeof createdOn === "number") return parseEthicsDate(createdOn);
  const text = String(createdOn);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return "2026-04-01";
}
