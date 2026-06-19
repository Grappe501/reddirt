/**
 * Election Plan — auto-link phrases in operator guides to debate prep routes.
 */
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  EP_TRAP_LANES_HREF,
  epDebateTechniqueHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

export type GuideTextSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; label: string; href: string };

type PhraseLink = { phrase: string; href: string };

const PHRASE_LINKS: PhraseLink[] = [
  { phrase: "culture-war topic page", href: epDebateTechniqueHref("culture-war") },
  { phrase: "culture-war guide", href: epDebateTechniqueHref("culture-war") },
  { phrase: "Trap lane 6 — culture war", href: epTrapLaneHref("culture-war-escalation") },
  { phrase: "trap lane 6", href: epTrapLaneHref("culture-war-escalation") },
  { phrase: "Trap lane 6", href: epTrapLaneHref("culture-war-escalation") },
  { phrase: "hammer-attacks then culture-war", href: epDebateTechniqueHref("hammer-attacks") },
  { phrase: "hammer-attacks", href: epDebateTechniqueHref("hammer-attacks") },
  { phrase: "culture-war", href: epDebateTechniqueHref("culture-war") },
  { phrase: "if-stuck recovery lines", href: epDebateTechniqueHref("if-stuck") },
  { phrase: "if-stuck", href: epDebateTechniqueHref("if-stuck") },
  { phrase: "if you get stuck", href: epDebateTechniqueHref("if-stuck") },
  { phrase: "SOS question bank", href: EP_DEBATE_PREP_COMMAND_HREF },
  { phrase: "SOS questions", href: EP_DEBATE_PREP_COMMAND_HREF },
  { phrase: "sos-debate-questions", href: EP_DEBATE_PREP_COMMAND_HREF },
  { phrase: "trap lanes index", href: EP_TRAP_LANES_HREF },
  { phrase: "All trap lanes", href: EP_TRAP_LANES_HREF },
  { phrase: "trap lanes", href: EP_TRAP_LANES_HREF },
  { phrase: "Trap lanes", href: EP_TRAP_LANES_HREF },
  { phrase: "Claims gate", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "claims gate", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "claims ledger", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "mock debate", href: EP_DEBATE_PREP_REHEARSAL_HREF },
  { phrase: "rehearsal engine", href: EP_DEBATE_PREP_REHEARSAL_HREF },
  { phrase: "debate prep hub", href: EP_DEBATE_PREP_HREF },
  { phrase: "prep sections", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "Five topic guides", href: `${EP_DEBATE_TECHNIQUES_HREF}#topic-guides` },
  { phrase: "techniques library", href: EP_DEBATE_TECHNIQUES_HREF },
  { phrase: "Techniques library", href: EP_DEBATE_TECHNIQUES_HREF },
  { phrase: "three-way", href: epDebateTechniqueHref("three-way") },
  { phrase: "adversity", href: epDebateTechniqueHref("adversity") },
  { phrase: "Opposition research", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "opposition research", href: EP_OPPOSITION_RESEARCH_HREF },
  { phrase: "debate coaching", href: EP_DEBATE_PREP_COMMAND_HREF },
  { phrase: "Civic Index", href: EP_OPPOSITION_RESEARCH_HREF },
].sort((a, b) => b.phrase.length - a.phrase.length);

const PREFIX_RE = /^\[(OFFENSE|DEFENSE|VERIFY)\]\s*/;

export function parseGuideListItem(raw: string): { badge?: "OFFENSE" | "DEFENSE" | "VERIFY"; body: string } {
  const match = raw.match(PREFIX_RE);
  if (!match) return { body: raw };
  return { badge: match[1] as "OFFENSE" | "DEFENSE" | "VERIFY", body: raw.slice(match[0].length) };
}

export function splitGuideTextWithLinks(text: string): GuideTextSegment[] {
  if (!text) return [{ kind: "text", value: "" }];

  for (const { phrase, href } of PHRASE_LINKS) {
    const idx = text.indexOf(phrase);
    if (idx < 0) continue;
    const before = text.slice(0, idx);
    const after = text.slice(idx + phrase.length);
    return [
      ...splitGuideTextWithLinks(before),
      { kind: "link", label: phrase, href },
      ...splitGuideTextWithLinks(after),
    ];
  }

  return [{ kind: "text", value: text }];
}

export const TECHNIQUES_QUICK_LINKS = [
  { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
  { href: EP_DEBATE_PREP_COMMAND_HREF, label: "SOS question bank" },
  { href: EP_TRAP_LANES_HREF, label: "Trap lanes" },
  { href: EP_OPPOSITION_RESEARCH_HREF, label: "Claims & opposition research" },
  { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal engine" },
] as const;

export const TECHNIQUE_READ_ORDER = [
  { topicId: "hammer-attacks", label: "1 · Hammer attacks" },
  { topicId: "culture-war", label: "2 · Culture-war defense" },
  { topicId: "if-stuck", label: "3 · If stuck" },
  { topicId: "adversity", label: "4 · Adversity" },
  { topicId: "three-way", label: "5 · Three-way debate" },
] as const;
