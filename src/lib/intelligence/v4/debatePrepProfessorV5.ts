/**
 * Debate prep professor v5 — collegiate seminar, moot court, office hours modes.
 */
import fs from "node:fs";
import path from "node:path";

export const DEBATE_PREP_PROFESSOR_HUB_HREF = "/admin/intelligence/debate-prep-tutor";

export type DebatePrepProfessorMode =
  | "office-hours-10"
  | "seminar-25"
  | "moot-court-45"
  | "forensic-audit";

export type ProfessorModeConfig = {
  mode: DebatePrepProfessorMode;
  label: string;
  minutes: number;
  headline: string;
  professorOpening: string;
  cardCap: number;
  queueId: "standard-tonight" | "sos-speak-order" | "trap-pivot";
  sequenceId: string | null;
  pedagogicalFocus: string[];
  deliversLecture: boolean;
  deliversMoot: boolean;
};

export const PROFESSOR_PEDAGOGY_FRAMEWORK = {
  headline: "Collegiate debate professor — applied political communication",
  pillars: [
    {
      id: "thesis-evidence-pivot",
      title: "Thesis → Evidence → Pivot",
      rule: "Every answer needs a claim (thesis), one verified receipt (evidence), and a bridge to SOS service (pivot). This is appellate advocacy adapted for a three-way panel.",
    },
    {
      id: "forensic-not-theatrical",
      title: "Forensic, not theatrical",
      rule: "Professor standard: logos first. Pathos only through county stories you can verify. Ethos through preparation — cite Arkleg, not opposition research gossip.",
    },
    {
      id: "cross-examination-discipline",
      title: "Cross-examination discipline",
      rule: "One trap question per exchange. Let silence work. Moot court rule: if you ask three questions, you lose the jury.",
    },
    {
      id: "seminar-close",
      title: "Seminar close",
      rule: "End every practice answer with an administrable pledge: what Kelly will DO as SOS — not what Hammer failed to do as Senator.",
    },
    {
      id: "rhetorical-audit",
      title: "Rhetorical audit rubric",
      rule: "Grade yourself: Clarity (one idea/sentence), Structure (thesis-evidence-pivot), Forensic (sourced), Time (30/60/90), Composure (no motive attacks).",
    },
  ],
} as const;

export const PROFESSOR_MODE_CONFIGS: Record<DebatePrepProfessorMode, ProfessorModeConfig> = {
  "office-hours-10": {
    mode: "office-hours-10",
    label: "10 min · Office hours",
    minutes: 10,
    headline: "Professor office hours — one concept, one drill",
    professorOpening:
      "Welcome to office hours. We are not covering the whole syllabus — one trap or SOS concept, one thesis statement, one rehearsal. Ask me why before you ask what to say.",
    cardCap: 1,
    queueId: "trap-pivot",
    sequenceId: null,
    pedagogicalFocus: ["thesis-evidence-pivot", "forensic-not-theatrical"],
    deliversLecture: true,
    deliversMoot: false,
  },
  "seminar-25": {
    mode: "seminar-25",
    label: "25 min · Seminar",
    minutes: 25,
    headline: "Seminar session — lecture + coached cards + Socratic Q&A",
    professorOpening:
      "Seminar format: ten-minute framing lecture on tonight's highest-probability exchange, then three coached cards with Socratic questions. You defend your thesis — I push back like a moderator.",
    cardCap: 3,
    queueId: "standard-tonight",
    sequenceId: "kelly-pre-stage",
    pedagogicalFocus: ["thesis-evidence-pivot", "seminar-close", "cross-examination-discipline"],
    deliversLecture: true,
    deliversMoot: false,
  },
  "moot-court-45": {
    mode: "moot-court-45",
    label: "45 min · Moot court",
    minutes: 45,
    headline: "Moot court — full queue, cross-examination, professor grading",
    professorOpening:
      "Moot court: I play moderator and opposition. You deliver opening thesis, survive cross on claims, pivot under trap pressure. Full standard tonight queue with professor rubric grading on every practice answer.",
    cardCap: 6,
    queueId: "standard-tonight",
    sequenceId: "tutor-check-my-record",
    pedagogicalFocus: ["cross-examination-discipline", "rhetorical-audit", "forensic-not-theatrical", "seminar-close"],
    deliversLecture: true,
    deliversMoot: true,
  },
  "forensic-audit": {
    mode: "forensic-audit",
    label: "12 min · Forensic audit",
    minutes: 12,
    headline: "Forensic audit — rhetorical rubric on your last practice answer",
    professorOpening:
      "Bring one answer you plan to use tonight. I grade on Clarity, Structure, Forensic sourcing, Time discipline, and Composure — collegiate debate rubric adapted for SOS panel.",
    cardCap: 2,
    queueId: "sos-speak-order",
    sequenceId: null,
    pedagogicalFocus: ["rhetorical-audit", "forensic-not-theatrical"],
    deliversLecture: false,
    deliversMoot: false,
  },
};

export type ProfessorLecture = {
  title: string;
  thesis: string;
  sections: { heading: string; bullets: string[] }[];
  socraticWarmup: string[];
  assignedReading: { href: string; title: string }[];
};

export function getProfessorModeConfig(mode: DebatePrepProfessorMode): ProfessorModeConfig {
  return PROFESSOR_MODE_CONFIGS[mode];
}

export function listProfessorModes(): ProfessorModeConfig[] {
  return Object.values(PROFESSOR_MODE_CONFIGS);
}

export function buildProfessorLecture(
  mode: DebatePrepProfessorMode,
  topic: string,
  cardTitles: string[],
): ProfessorLecture {
  const config = getProfessorModeConfig(mode);
  return {
    title: `${config.label} — ${topic}`,
    thesis: `Tonight's governing thesis for "${topic}": Secretary of State is a statewide service desk — integrity and participation together, not Hammer's legislative-author frame.`,
    sections: [
      {
        heading: "I. Applied civics frame",
        bullets: [
          "Distinguish author (Senate) vs administrator (SOS) — this is the semester's central thesis.",
          "Three-way panel: Kelly is the calm forensic voice; Hammer brings slogans; Packo brings process reform — agree where fair, contrast on implementation.",
        ],
      },
      {
        heading: "II. Evidence standards (forensic)",
        bullets: [
          "Tier A: human-verified claims and Arkleg-cited acts only on stage.",
          "Tier B: NEEDS_REVIEW — research-question framing until staff clears.",
          "Never close on agree-only — seminar rule: agreement + fresh add.",
        ],
      },
      {
        heading: "III. Tonight's drill cards",
        bullets: cardTitles.length
          ? cardTitles.map((t, i) => `Card ${i + 1}: ${t}`)
          : ["Open drill queue — standard tonight sequence."],
      },
      {
        heading: "IV. Stage application",
        bullets: [
          "30-second answer: thesis + one act + one county harm + SOS pledge.",
          "If Hammer says check my record — welcome, verify acts, reframe job, one trap question, exit.",
          config.deliversMoot ? "Moot phase: I cross-examine after your opening — defend with sources only." : "Office hours ends with one out-loud rehearsal.",
        ],
      },
    ],
    socraticWarmup: [
      `Why would a moderator ask about "${topic}" in a SOS race — not a Senate race?`,
      "What is your one-sentence thesis if you only had fifteen seconds?",
      "Where is the pivot from record comparison to clerk service?",
    ],
    assignedReading: cardTitles.slice(0, 3).map((title, i) => ({
      href: "/admin/intelligence/debate-prep-tutor",
      title,
    })),
  };
}

export type ProfessorRubricGrade = {
  dimension: "clarity" | "structure" | "forensic" | "time" | "composure";
  label: string;
  score: number;
  note: string;
};

export function gradePracticeAnswerProfessor(
  practiceAnswer: string,
  targetSeconds: number = 45,
): { overall: number; grades: ProfessorRubricGrade[]; professorVerdict: string } {
  const words = practiceAnswer.split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round(words * 0.45);
  const lower = practiceAnswer.toLowerCase();

  const grades: ProfessorRubricGrade[] = [];

  const clarity =
    words >= 25 && words <= 130 && !/\.{2,}|,{3,}/.test(practiceAnswer) ? 85 : words < 15 ? 45 : 65;
  grades.push({
    dimension: "clarity",
    label: "Clarity",
    score: clarity,
    note: clarity >= 80 ? "One idea per sentence discipline visible." : "Tighten — one thesis, fewer clauses.",
  });

  const hasThesis = /\b(secretary of state|sos|administer|clerks?|county|integrity|participation)\b/i.test(lower);
  const hasEvidence = /\b(act|sb|hb|verified|arkleg|bill)\b/i.test(lower);
  const hasPivot = /\b(but|however|also|additionally|pledge|will|as secretary)\b/i.test(lower);
  const structure = (hasThesis ? 30 : 0) + (hasEvidence ? 35 : 0) + (hasPivot ? 35 : 0);
  grades.push({
    dimension: "structure",
    label: "Structure (thesis-evidence-pivot)",
    score: structure,
    note:
      structure >= 80
        ? "Thesis-evidence-pivot arc present."
        : `Missing: ${!hasThesis ? "thesis " : ""}${!hasEvidence ? "evidence " : ""}${!hasPivot ? "pivot" : ""}`,
  });

  const forensic = /\b(act|sb|hb)\s*\d+/i.test(lower) && !/\b(verified|arkleg|checked)\b/i.test(lower) ? 40 : hasEvidence ? 80 : 55;
  grades.push({
    dimension: "forensic",
    label: "Forensic sourcing",
    score: forensic,
    note: forensic >= 75 ? "Sourcing language acceptable." : "Cite Arkleg verification or drop act numbers.",
  });

  const timeScore = estSeconds <= targetSeconds + 15 && estSeconds >= targetSeconds - 20 ? 90 : estSeconds > targetSeconds + 30 ? 50 : 70;
  grades.push({
    dimension: "time",
    label: "Time discipline",
    score: timeScore,
    note: `~${estSeconds}s estimated · target ~${targetSeconds}s`,
  });

  const composure = /\b(liar|hate|fraudster|corrupt|stole)\b/i.test(lower) ? 30 : 85;
  grades.push({
    dimension: "composure",
    label: "Composure",
    score: composure,
    note: composure >= 80 ? "Forensic tone — no motive attacks." : "Drop motive language — forensic contrast only.",
  });

  const overall = Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length);
  const professorVerdict =
    overall >= 85
      ? "A-range — defendable on stage after staff verifies any act numbers."
      : overall >= 70
        ? "B-range — revise structure; rehearse once more at 20% slower pace."
        : overall >= 55
          ? "C-range — rebuild thesis-evidence-pivot before stage."
          : "Incomplete — office hours continues; do not use this answer tonight.";

  return { overall, grades, professorVerdict };
}
