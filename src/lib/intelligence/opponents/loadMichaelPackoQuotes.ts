import fs from "node:fs";
import path from "node:path";

export type PackoQuoteEntry = {
  id: string;
  topic: string;
  quoteText: string;
  paraphraseAllowed?: boolean;
  evidenceStatus: string;
  sourceConfidence: string;
  sources: Array<{ label: string; url: string }>;
  kellyResponseFrame?: string;
  doNotMisquote?: string | null;
};

export type MichaelPackoQuotesFile = {
  candidateId: string;
  quotes: PackoQuoteEntry[];
};

const QUOTES_PATH = path.join(
  process.cwd(),
  "data/opposition/michael-packo-profile/michael-packo-quotes.json",
);

export function loadMichaelPackoQuotes(): MichaelPackoQuotesFile {
  return JSON.parse(fs.readFileSync(QUOTES_PATH, "utf8")) as MichaelPackoQuotesFile;
}

export function loadPackoFinanceScaffold() {
  const p = path.join(process.cwd(), "data/opposition/michael-packo-profile/packo-finance-filings-scaffold.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    taskId: string;
    status: string;
    summarySlots: Record<string, string | null>;
    sources: Array<{ label: string; url: string; status: string }>;
    notes: string;
    claimsGate: string;
  };
}
