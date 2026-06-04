import fs from "node:fs";
import path from "node:path";
import { SOS_DEBATE_QUESTION_BANK } from "@/lib/intelligence/v4/sosDebateQuestionBankData";
import type {
  SosDebateQuestionDrillDown,
  SosDebateQuestionSummary,
} from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import {
  getSosCategoryEncounterDepth,
  mergeEncounterDepth,
} from "@/lib/intelligence/v4/debatePlainLanguageDepth";

export type SosDebateQuestionResearchFile = {
  version: number;
  generatedAt: string;
  governance: string;
  sosOfficeDutiesArkansas: string[];
  researchRefs: Array<{ id: string; source: string; url: string; topics: string[] }>;
  nationalQuestionPatterns: string[];
  arkansas2026ThreeWayNotes: string[];
};

export function getAllSosDebateQuestionIds(): string[] {
  return SOS_DEBATE_QUESTION_BANK.map((q) => q.questionId);
}

export function getSosDebateQuestionDrillDown(questionId: string): SosDebateQuestionDrillDown | undefined {
  const row = SOS_DEBATE_QUESTION_BANK.find((q) => q.questionId === questionId);
  if (!row) return undefined;
  const encounterDepth = mergeEncounterDepth(
    row.encounterDepth,
    getSosCategoryEncounterDepth(row.category),
  );
  return encounterDepth ? { ...row, encounterDepth } : row;
}

export function listSosDebateQuestionSummaries(): SosDebateQuestionSummary[] {
  return SOS_DEBATE_QUESTION_BANK.map((q) => ({
    questionId: q.questionId,
    questionNumber: q.questionNumber,
    title: q.title,
    categoryLabel: q.categoryLabel,
    probability: q.probability,
    oneLinePrep: q.directAnswer30s,
  }));
}

export function listSosDebateQuestionsByCategory(): Array<{
  category: string;
  categoryLabel: string;
  questions: SosDebateQuestionSummary[];
}> {
  const map = new Map<string, { categoryLabel: string; questions: SosDebateQuestionSummary[] }>();
  for (const q of SOS_DEBATE_QUESTION_BANK) {
    const entry = map.get(q.category) ?? { categoryLabel: q.categoryLabel, questions: [] };
    entry.questions.push({
      questionId: q.questionId,
      questionNumber: q.questionNumber,
      title: q.title,
      categoryLabel: q.categoryLabel,
      probability: q.probability,
      oneLinePrep: q.directAnswer30s,
    });
    map.set(q.category, entry);
  }
  return [...map.entries()].map(([category, v]) => ({ category, ...v }));
}

export function loadSosDebateQuestionResearch(): SosDebateQuestionResearchFile | null {
  try {
    const abs = path.join(process.cwd(), "data/intelligence/sos-debate-question-research.json");
    return JSON.parse(fs.readFileSync(abs, "utf8")) as SosDebateQuestionResearchFile;
  } catch {
    return null;
  }
}

export const SOS_DEBATE_SPEAK_ORDER_RULE =
  "Never end with 'I agree' alone — always add transparency/accountability, non-partisan service, public education, county detail, or verified record anchor. Speaking 1st: set unity frame. 2nd: agree + fresh theme. 3rd: memorable close (Civic Index or cross-aisle line when fit).";

export { KELLY_FIELD_TESTED_THEMES, KELLY_UNITY_SPINE } from "@/lib/intelligence/v4/kellyTestedDebateThemes";
