import fs from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://datahub.io/fivethirtyeight/congress-trump-score/_r/-/data/vote_predictions.csv";
const HILL_BIOGUIDE = "H001072";
const OUT = path.join(process.cwd(), "data", "research", "trump-score-leads.json");

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function main() {
  const response = await fetch(SOURCE, {
    headers: { "user-agent": "FrenchHillVoteTracker/0.1 (+public-record research)" },
  });
  if (!response.ok) throw new Error(`Failed to fetch legacy Trump score dataset: HTTP ${response.status}`);

  const rows = parseCsv(await response.text());
  const hillRows = rows.filter((row) => row.bioguide === HILL_BIOGUIDE && row.chamber === "house");
  const disagreements = hillRows.filter((row) => row.agree === "0");

  const leads = disagreements.map((row) => ({
    billId: row.bill_id || null,
    rollId: row.roll_id || null,
    votedAt: row.voted_at || null,
    hillVote: row.vote || null,
    trumpPosition: row.trump_position || null,
    sourceDataset: "FiveThirtyEight Congress Trump Score (archived mirror)",
    sourceUrl: SOURCE,
    status: "research-lead",
    verificationRequired: true,
    note: "This is a discovery lead only. Verify the House roll call and Trump's documented position independently before adding to trump-evidence.json.",
  }));

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), totalHillRows: hillRows.length, disagreementLeads: leads.length, leads }, null, 2));
  console.log(`Generated ${leads.length} Trump-disagreement research lead(s) from ${hillRows.length} Hill vote row(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
