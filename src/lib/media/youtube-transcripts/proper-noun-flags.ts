/**
 * Proper-noun / campaign-term flagger for editor review (advisory only).
 */

export type ProperNounFlag = {
  term: string;
  category:
    | "PERSON"
    | "OFFICE"
    | "COUNTY"
    | "CITY"
    | "ORGANIZATION"
    | "ELECTION_TERM"
    | "OTHER";
  confidence: number;
  sampleContext?: string;
};

const KNOWN: Array<{ term: string; category: ProperNounFlag["category"]; confidence: number }> = [
  { term: "Kelly Grappe", category: "PERSON", confidence: 0.98 },
  { term: "Secretary of State", category: "OFFICE", confidence: 0.95 },
  { term: "County Clerk", category: "OFFICE", confidence: 0.9 },
  { term: "Arkansas", category: "OTHER", confidence: 0.85 },
  { term: "ballot initiative", category: "ELECTION_TERM", confidence: 0.88 },
  { term: "voter registration", category: "ELECTION_TERM", confidence: 0.88 },
  { term: "election administration", category: "ELECTION_TERM", confidence: 0.9 },
  { term: "voting system", category: "ELECTION_TERM", confidence: 0.86 },
  { term: "early voting", category: "ELECTION_TERM", confidence: 0.86 },
  { term: "absentee", category: "ELECTION_TERM", confidence: 0.8 },
  { term: "Pulaski", category: "COUNTY", confidence: 0.82 },
  { term: "Benton", category: "COUNTY", confidence: 0.8 },
  { term: "Washington", category: "COUNTY", confidence: 0.75 },
  { term: "Garland", category: "COUNTY", confidence: 0.8 },
  { term: "Sebastian", category: "COUNTY", confidence: 0.8 },
  { term: "Craighead", category: "COUNTY", confidence: 0.8 },
  { term: "Little Rock", category: "CITY", confidence: 0.88 },
  { term: "Fayetteville", category: "CITY", confidence: 0.85 },
  { term: "Fort Smith", category: "CITY", confidence: 0.85 },
  { term: "Hot Springs", category: "CITY", confidence: 0.85 },
  { term: "Hot Springs Village", category: "CITY", confidence: 0.9 },
  { term: "Jonesboro", category: "CITY", confidence: 0.85 },
];

/** Suspicious ASR spellings that often need human review. */
const SUSPECT_PATTERNS: Array<{ re: RegExp; label: string; confidence: number }> = [
  { re: /\bkelly\s+grap+e?\b/i, label: "Possible Kelly Grappe misspelling", confidence: 0.7 },
  { re: /\bsecretary\s+of\s+state'?s?\b/i, label: "Secretary of State mention", confidence: 0.6 },
  { re: /\bcounty\s+clerks?\b/i, label: "County Clerk terminology", confidence: 0.6 },
];

export function flagProperNouns(text: string): ProperNounFlag[] {
  const flags: ProperNounFlag[] = [];
  const lower = text;

  for (const item of KNOWN) {
    const idx = lower.toLowerCase().indexOf(item.term.toLowerCase());
    if (idx >= 0) {
      flags.push({
        term: item.term,
        category: item.category,
        confidence: item.confidence,
        sampleContext: lower.slice(Math.max(0, idx - 40), Math.min(lower.length, idx + item.term.length + 40)),
      });
    }
  }

  for (const s of SUSPECT_PATTERNS) {
    const m = s.re.exec(text);
    if (m) {
      flags.push({
        term: s.label,
        category: "OTHER",
        confidence: s.confidence,
        sampleContext: m[0],
      });
    }
  }

  // Deduplicate by term
  const seen = new Set<string>();
  return flags.filter((f) => {
    const k = `${f.category}:${f.term.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
