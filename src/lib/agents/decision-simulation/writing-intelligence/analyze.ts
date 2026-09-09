import type {
  IssueVoiceId,
  LinguisticFeatures,
  MotifHit,
  RhetoricScores,
  StructureHits,
} from "./contracts";

const STOP = new Set(
  "the a an and or but if then to of in on for with from as at by is are was were be been being this that these those you your we our they their it its not no nor so than too very just into over after before about can will would should could may might must also more most some any all each other only own same such than".split(
    " ",
  ),
);

const JONES_MOTIFS = [
  "building",
  "community",
  "future",
  "fairness",
  "system",
  "accountability",
  "affordability",
  "arkansas",
  "families",
  "hope",
  "faith",
  "science",
  "engineering",
  "rocket",
  "kitchen",
  "people",
  "power",
];

const HILL_MOTIFS = [
  "friends",
  "arkansas",
  "hardworking",
  "committee",
  "bipartisan",
  "proud",
  "constituent",
  "washington",
  "workforce",
  "housing",
  "fraud",
  "small business",
  "central arkansas",
];

export function hashFingerprint(parts: string[]): string {
  const text = parts.join("|").toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `src-${(hash >>> 0).toString(16)}`;
}

export function clipExcerpt(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max)}…`;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function paragraphsOf(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20);
}

function rate(count: number, total: number): number {
  if (total <= 0) return 0;
  return Number((count / total).toFixed(4));
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const next = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Number(next.toFixed(2));
}

function contains(text: string, patterns: RegExp[]): number {
  return patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0);
}

export function analyzeFeatures(text: string): LinguisticFeatures {
  const sentences = sentencesOf(text);
  const paragraphs = paragraphsOf(text);
  const lengths = sentences.map((item) => tokenize(item).length);
  const avgSentenceLength = lengths.length
    ? Number((lengths.reduce((sum, value) => sum + value, 0) / lengths.length).toFixed(2))
    : 0;
  const shortPunch = lengths.filter((value) => value > 0 && value <= 8).length;
  const questions = sentences.filter((item) => item.includes("?")).length;
  const imperatives = sentences.filter((item) => /^(let's|do |build |fight |protect |support |join |contact )/i.test(item)).length;
  const fragments = sentences.filter((item) => tokenize(item).length > 0 && tokenize(item).length <= 5 && !/[.]$/.test(item)).length;
  const lists = (text.match(/^(\s*[-*]|\s*\d+\.)/gm) ?? []).length;
  const openings = sentences.map((item) => tokenize(item)[0] ?? "");
  const openingCounts = new Map<string, number>();
  for (const word of openings) openingCounts.set(word, (openingCounts.get(word) ?? 0) + 1);
  const repetition = [...openingCounts.values()].filter((value) => value >= 3).length;
  const parallel = sentences.filter((item) => /^(we |i |this |that |when |if )/i.test(item)).length;
  const threePart = (text.match(/\b(\w+),\s+(\w+),?\s+and\s+(\w+)\b/gi) ?? []).length;
  const longSetupShortClose = sentences.filter((_, index) => {
    if (index === 0) return false;
    return (lengths[index - 1] ?? 0) >= 22 && (lengths[index] ?? 0) <= 8;
  }).length;

  return {
    sentenceCount: sentences.length,
    paragraphCount: Math.max(paragraphs.length, 1),
    avgSentenceLength,
    sentenceLengthVariance: variance(lengths),
    avgParagraphLength: Number(
      (
        tokenize(text).length / Math.max(paragraphs.length, 1)
      ).toFixed(2),
    ),
    questionRate: rate(questions, sentences.length),
    imperativeRate: rate(imperatives, sentences.length),
    fragmentRate: rate(fragments, sentences.length),
    listMarkerRate: rate(lists, Math.max(paragraphs.length, 1)),
    shortPunchRate: rate(shortPunch, sentences.length),
    repetitionRate: rate(repetition, Math.max(openingCounts.size, 1)),
    parallelRate: rate(parallel, sentences.length),
    threePartRate: rate(threePart, Math.max(sentences.length, 1)),
    longSetupShortCloseRate: rate(longSetupShortClose, Math.max(sentences.length, 1)),
  };
}

export function analyzeRhetoric(text: string): RhetoricScores {
  const lower = text.toLowerCase();
  const sentences = Math.max(sentencesOf(text).length, 1);
  const score = (count: number) => Number(Math.min(1, count / Math.max(3, sentences / 8)).toFixed(4));
  return {
    metaphor: score(contains(lower, [/like a /, /is a system/, /fracture/, /grid/, /equation/, /physics of/])),
    analogy: score(contains(lower, [/here's what it means/, /rocket science/, /garbage in/, /closed system/, /open system/, /public good/])),
    anecdote: score(contains(lower, [/\bi know what it feels/, /\bmy family\b/, /\bwhen i\b/, /\bi certainly\b/])),
    statistics: score((lower.match(/\b\d+(\.\d+)?%|\b\d{1,3}(,\d{3})+\b|\b\$\d+/g) ?? []).length),
    authority: score(contains(lower, [/committee/, /congress/, /as chairman/, /as a member of congress/, /house financial/])),
    moralFraming: score(contains(lower, [/fairness/, /dignity/, /accountability/, /belonging/, /justice/, /faith/])),
    personalNarrative: score(contains(lower, [/\bi\b/, /\bmy\b/, /\bwe\b/]) > 8 ? 3 : contains(lower, [/\bi grew\b/, /\bas for me\b/])),
    localExample: score(contains(lower, [/arkansas/, /little rock/, /pine bluff/, /conway/, /central arkansas/])),
    opponentContrast: score(contains(lower, [/french hill/, /congressman hill/, /wall street/, /democrat/, /washington vs/])),
    rhetoricalQuestion: score((text.match(/\?/g) ?? []).length),
    callToAction: score(contains(lower, [/we can/, /join/, /contact my office/, /i'm running/, /the work ahead/, /show up/])),
    optimismAfterDiagnosis: score(contains(lower, [/the good news/, /the great news/, /we can change/, /hope/, /we can choose/])),
    institutionalProcess: score(contains(lower, [/legislation/, /bipartisan/, /voted/, /signed into law/, /oversight/, /appropriations/])),
  };
}

export function analyzeStructure(text: string): StructureHits {
  const lower = text.toLowerCase();
  const jones =
    Number(/\b(i know what it feels|as for me|my family|girl dad)\b/.test(lower)) +
    Number(/\b(equation|physics of|rocket science|garbage in|closed system|open system)\b/.test(lower)) +
    Number(/\b(fairness|dignity|belonging|accountability for all)\b/.test(lower)) +
    Number(/\b(kitchen table|grocery|working families|arkansas families)\b/.test(lower)) +
    Number(/\b(blessings|i'm running|the work ahead|we can choose)\b/.test(lower));
  const hill =
    Number(/\bfriends,/.test(lower)) +
    Number(/\b(\d+%|\$\d+|million|billion)\b/.test(lower)) +
    Number(/\b(committee|as chairman|financial services)\b/.test(lower)) +
    Number(/\b(central arkansas|little rock|conway|second district)\b/.test(lower)) +
    Number(/\b(i am proud|proud to|my office|if you need assistance)\b/.test(lower));
  return {
    jonesArc: Number((jones / 5).toFixed(4)),
    hillArc: Number((hill / 5).toFixed(4)),
  };
}

export function analyzeMotifs(text: string, actorId: string): MotifHit[] {
  const lower = text.toLowerCase();
  const motifs = actorId === "french-hill-ar02" ? HILL_MOTIFS : JONES_MOTIFS;
  return motifs
    .map((motif) => ({
      motif,
      count: (lower.match(new RegExp(`\\b${motif.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) ?? []).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function analyzeLexical(text: string) {
  const tokens = tokenize(text);
  const total = Math.max(tokens.length, 1);
  const has = (words: string[]) => words.filter((word) => tokens.includes(word)).length / total;
  return {
    technical: Number(has(["system", "algorithm", "infrastructure", "physics", "equation", "data", "ai", "grid"]).toFixed(4)),
    religious: Number(has(["faith", "blessings", "easter", "resurrection", "church", "prayer", "god"]).toFixed(4)),
    arkansas: Number(has(["arkansas", "arkansans", "conway", "pine", "bluff", "little"]).toFixed(4)),
    political: Number(has(["congress", "committee", "vote", "democrat", "republican", "legislation"]).toFixed(4)),
    abstraction: Number(has(["system", "power", "contract", "accountability", "infrastructure", "representation"]).toFixed(4)),
  };
}

export function classifyIssueVoices(title: string, text: string): IssueVoiceId[] {
  const hay = `${title}\n${text}`.toLowerCase();
  const hits: Array<[IssueVoiceId, boolean]> = [
    ["ECONOMIC", /afford|price|cost|tax|bank|wage|inflation|money|housing payment/.test(hay)],
    ["ATTACK_CONTRAST", /french hill has|wall street is winning|fought to weaken|congressional democrats|biden administration|inflation is out-of-control|misguided policies/.test(hay)],
    ["BIPARTISAN", /bipartisan|both parties|across the aisle/.test(hay)],
    ["PERSONAL", /my family|mother's day|i know what it feels|girl dad/.test(hay)],
    ["FAITH_VALUES", /faith|easter|resurrection|blessings,|church |in good faith/.test(hay)],
    ["POLICY_EXPLANATION", /section 2|committee|legislation|reimbursement|algorithmic/.test(hay)],
    ["CRISIS", /chaos|shutdown|fracture|closing|emergency|storm/.test(hay)],
    ["COMMUNITY", /community|neighbor|kitchen table|local|district/.test(hay)],
    ["TECHNOLOGY", /\bai\b|algorithm|data center|quantum|rocket science|cyber/.test(hay)],
    ["FUNDRAISING_CAMPAIGN", /i'm running|join us|campaign|donate/.test(hay)],
    ["CALL_TO_ACTION", /contact my office|we can|show up|the work ahead|i will/.test(hay)],
  ];
  const voices = hits.filter(([, ok]) => ok).map(([id]) => id);
  return voices.length ? voices : ["POLICY_EXPLANATION"];
}

export function classifyTopics(title: string, text: string): string[] {
  const hay = `${title}\n${text}`.toLowerCase();
  const tags = [
    ["economy", /bank|tax|wage|profit|inflation|money/],
    ["affordability", /afford|price|cost|grocery|rent/],
    ["housing", /hous(e|ing)|home|mortgage|builder/],
    ["technology", /\bai\b|algorithm|data|cyber|quantum/],
    ["faith", /faith|easter|church|blessings|resurrection/],
    ["accountability", /accountab|oversight|fraud|ethics/],
    ["workforce", /workforce|job|career|hbcu|skill/],
    ["elections", /vote|map|representation|election|democracy/],
    ["arkansas", /arkansas|little rock|conway|pine bluff/],
    ["national", /america|congress|washington|federal/],
    ["bipartisan", /bipartisan/],
    ["contrast", /french hill|wall street|democrat|republican/],
  ] as const;
  return tags.filter(([, pattern]) => pattern.test(hay)).map(([tag]) => tag);
}

export function contentWords(text: string, limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    if (token.length < 4 || STOP.has(token) || /^\d+$/.test(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function emptyRhetoric(): RhetoricScores {
  return {
    metaphor: 0,
    analogy: 0,
    anecdote: 0,
    statistics: 0,
    authority: 0,
    moralFraming: 0,
    personalNarrative: 0,
    localExample: 0,
    opponentContrast: 0,
    rhetoricalQuestion: 0,
    callToAction: 0,
    optimismAfterDiagnosis: 0,
    institutionalProcess: 0,
  };
}

export function averageRhetoric(rows: RhetoricScores[]): RhetoricScores {
  const next = emptyRhetoric();
  if (!rows.length) return next;
  const keys = Object.keys(next) as Array<keyof RhetoricScores>;
  for (const key of keys) {
    next[key] = Number((rows.reduce((sum, row) => sum + row[key], 0) / rows.length).toFixed(4));
  }
  return next;
}

export function averageFeatures(rows: LinguisticFeatures[]): LinguisticFeatures {
  if (!rows.length) {
    return {
      sentenceCount: 0,
      paragraphCount: 0,
      avgSentenceLength: 0,
      sentenceLengthVariance: 0,
      avgParagraphLength: 0,
      questionRate: 0,
      imperativeRate: 0,
      fragmentRate: 0,
      listMarkerRate: 0,
      shortPunchRate: 0,
      repetitionRate: 0,
      parallelRate: 0,
      threePartRate: 0,
      longSetupShortCloseRate: 0,
    };
  }
  const keys = Object.keys(rows[0]) as Array<keyof LinguisticFeatures>;
  const out = { ...rows[0] };
  for (const key of keys) {
    out[key] = Number((rows.reduce((sum, row) => sum + row[key], 0) / rows.length).toFixed(4));
  }
  return out;
}
