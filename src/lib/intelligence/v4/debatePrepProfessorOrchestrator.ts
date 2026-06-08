/**
 * Debate prep professor v5 orchestrator — seminar, moot court, office hours sessions.
 */
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import {
  DEBATE_PREP_PROFESSOR_LECTURE_PROMPT,
  DEBATE_PREP_PROFESSOR_MOOT_PROMPT,
} from "@/lib/openai/prompts";
import {
  buildDebatePrepTutorSession,
  critiqueTutorPracticeAnswer,
  type TutorSession,
} from "@/lib/intelligence/v4/debatePrepTutorOrchestrator";
import {
  buildProfessorLecture,
  getProfessorModeConfig,
  gradePracticeAnswerProfessor,
  PROFESSOR_PEDAGOGY_FRAMEWORK,
  type DebatePrepProfessorMode,
  type ProfessorLecture,
  type ProfessorRubricGrade,
} from "@/lib/intelligence/v4/debatePrepProfessorV5";

export const DEBATE_PREP_TUTOR_V2_VERSION = "tutor-v2.0-professor";

export type ProfessorTutorSession = TutorSession & {
  version: typeof DEBATE_PREP_TUTOR_V2_VERSION;
  professorMode: DebatePrepProfessorMode;
  professorConfig: ReturnType<typeof getProfessorModeConfig>;
  lecture: ProfessorLecture;
  pedagogyPillars: typeof PROFESSOR_PEDAGOGY_FRAMEWORK.pillars;
};

const PROFESSOR_TO_TUTOR_MODE: Record<
  DebatePrepProfessorMode,
  "panic-5" | "tonight-15" | "deep-30" | "check-my-record" | "three-way-panel"
> = {
  "office-hours-10": "panic-5",
  "seminar-25": "tonight-15",
  "moot-court-45": "deep-30",
  "forensic-audit": "three-way-panel",
};

export function buildProfessorTutorSession(mode: DebatePrepProfessorMode, topic = "debate prep"): ProfessorTutorSession {
  const professorConfig = getProfessorModeConfig(mode);
  const baseMode = PROFESSOR_TO_TUTOR_MODE[mode];
  const base = buildDebatePrepTutorSession(baseMode);

  const cardMeta = base.cards.map((c) => ({ title: c.card.title, href: c.card.href }));
  const lecture = buildProfessorLecture(
    mode,
    topic,
    cardMeta.map((c) => c.title),
  );
  lecture.assignedReading = cardMeta.slice(0, 4).map((c) => ({ href: c.href, title: c.title }));

  return {
    ...base,
    version: DEBATE_PREP_TUTOR_V2_VERSION,
    professorMode: mode,
    professorConfig,
    lecture,
    pedagogyPillars: PROFESSOR_PEDAGOGY_FRAMEWORK.pillars.filter((p) =>
      professorConfig.pedagogicalFocus.includes(p.id),
    ),
    openingCoachMessage: professorConfig.professorOpening,
    config: {
      ...base.config,
      label: professorConfig.label,
      headline: professorConfig.headline,
      minutes: professorConfig.minutes,
      coachOpening: professorConfig.professorOpening,
    },
  };
}

export async function generateProfessorMootChallenge(
  practiceAnswer: string,
  cardTitle: string,
): Promise<string> {
  const fallback = `Professor cross-examination: You cited "${cardTitle}" — show me the Arkleg receipt or reframe as a research question. One trap question only, then stop.`;
  if (!isOpenAIConfigured() || practiceAnswer.trim().length < 10) return fallback;
  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      messages: [
        { role: "system", content: DEBATE_PREP_PROFESSOR_MOOT_PROMPT },
        { role: "user", content: JSON.stringify({ cardTitle, practiceAnswer }) },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function generateProfessorLectureNarrative(
  lecture: ProfessorLecture,
): Promise<string> {
  const fallback = [
    lecture.thesis,
    ...lecture.sections.flatMap((s) => [`${s.heading}:`, ...s.bullets.map((b) => `• ${b}`)]),
  ].join("\n");
  if (!isOpenAIConfigured()) return fallback;
  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.32,
      messages: [
        { role: "system", content: DEBATE_PREP_PROFESSOR_LECTURE_PROMPT },
        { role: "user", content: JSON.stringify(lecture) },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export type ProfessorCritiqueResult = {
  tutorCritique: Awaited<ReturnType<typeof critiqueTutorPracticeAnswer>>;
  rubric: { overall: number; grades: ProfessorRubricGrade[]; professorVerdict: string };
  mootChallenge: string | null;
};

export async function critiqueProfessorPracticeAnswer(
  card: Parameters<typeof critiqueTutorPracticeAnswer>[0],
  practiceAnswer: string,
  options: { moot?: boolean; topic?: string } = {},
): Promise<ProfessorCritiqueResult> {
  const tutorCritique = await critiqueTutorPracticeAnswer(card, practiceAnswer, options.topic);
  const rubric = gradePracticeAnswerProfessor(practiceAnswer);
  let mootChallenge: string | null = null;
  if (options.moot) {
    mootChallenge = await generateProfessorMootChallenge(practiceAnswer, card.title);
  }
  return { tutorCritique, rubric, mootChallenge };
}
