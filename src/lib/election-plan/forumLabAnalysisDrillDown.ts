/**
 * Forum lab — v1 analysis box drill-down (Hammer/Pakko themes, Kelly opportunities, etc.).
 */
import {
  EP_DEBATE_PREP_HREF,
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { FORUM_ANALYSIS_LESSONS } from "@/lib/election-plan/forumLabAnalysisLessonBank";

export type ForumAnalysisCategoryId =
  | "hammer-themes"
  | "pakko-themes"
  | "kelly-opportunities"
  | "predicted-debate-questions"
  | "watch-for-tells"
  | "newspaper-angles"
  | "claims-gate-notes";

export type ForumAnalysisDrillDownLink = { href: string; label: string };

export type ForumAnalysisLesson = {
  id: string;
  categoryId: ForumAnalysisCategoryId;
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
  forumEvidence: string[];
  debateLines: string[];
  practiceSteps: string[];
  claimsGate: string[];
  relatedLinks: ForumAnalysisDrillDownLink[];
};

export type ForumAnalysisCategory = {
  id: ForumAnalysisCategoryId;
  title: string;
  description: string;
  tone: "rose" | "amber" | "emerald" | "indigo" | "violet" | "sky";
  lessonOrder: string[];
};

export const FORUM_ANALYSIS_CATEGORIES: ForumAnalysisCategory[] = [
  {
    id: "hammer-themes",
    title: "Hammer themes",
    description: "Recurring ACCA forum frames from Senator Hammer — predict debate night language and prepare agree-add pivots.",
    tone: "rose",
    lessonOrder: [
      "experience-integrity",
      "clerk-collaboration",
      "civic-education",
      "election-security",
      "proactive-communication",
      "legal-compliance-voter-rights",
    ],
  },
  {
    id: "pakko-themes",
    title: "Pakko themes",
    description: "Libertarian outsider frames from Dr. Michael Pakko — respect lines and three-way geometry.",
    tone: "amber",
    lessonOrder: [
      "competition-politics",
      "transparency-integrity",
      "two-party-critique",
      "voter-engagement",
      "reducing-overreach",
    ],
  },
  {
    id: "kelly-opportunities",
    title: "Kelly opportunities",
    description: "Capitalize moves — where Kelly's ACCA performance maps to debate-night advantage.",
    tone: "emerald",
    lessonOrder: [
      "business-admin-competence",
      "civic-education-youth",
      "unifier-cross-party",
      "modernize-election-tech",
      "listen-county-clerks",
      "marketing-public-trust",
    ],
  },
  {
    id: "predicted-debate-questions",
    title: "Predicted debate questions",
    description: "Moderator lanes drawn from clerk survey questions at ACCA — rehearse 90-second answers.",
    tone: "indigo",
    lessonOrder: [
      "improve-voter-engagement",
      "ensure-election-integrity",
      "online-voter-registration",
      "address-misinformation",
      "sos-local-election-issues",
      "support-county-clerks",
      "election-technology-changes",
      "foster-party-collaboration",
    ],
  },
  {
    id: "watch-for-tells",
    title: "Tells to track",
    description: "Rhetorical tells from forum transcript — Day 2 observational drills.",
    tone: "violet",
    lessonOrder: [
      "hammer-personal-anecdotes",
      "pakko-outsider-rhetoric",
      "kelly-collaboration-unity",
      "body-language-confidence",
      "integrity-question-reactions",
    ],
  },
  {
    id: "newspaper-angles",
    title: "Newspaper angles",
    description: "Press narratives the forum sets up — stay on-message without feeding unsourced opponent stories.",
    tone: "sky",
    lessonOrder: [
      "kelly-collaborative-sos-vision",
      "civic-education-engagement",
      "candidates-election-security",
      "technology-future-elections",
    ],
  },
  {
    id: "claims-gate-notes",
    title: "Claims gate notes",
    description: "Verification tasks before any forum-derived line goes to debate, earned media, or paid media.",
    tone: "rose",
    lessonOrder: [
      "hammer-legislative-history",
      "pakko-ballot-access",
      "kelly-business-leadership",
      "voter-engagement-statistics",
      "election-technology-upgrades",
    ],
  },
];

const LESSON_BY_KEY = new Map<string, ForumAnalysisLesson>(
  FORUM_ANALYSIS_LESSONS.map((lesson) => [`${lesson.categoryId}/${lesson.id}`, lesson]),
);

export function getForumAnalysisCategory(categoryId: string): ForumAnalysisCategory | undefined {
  return FORUM_ANALYSIS_CATEGORIES.find((c) => c.id === categoryId);
}

export function getForumAnalysisLesson(
  categoryId: string,
  itemId: string,
): ForumAnalysisLesson | undefined {
  return LESSON_BY_KEY.get(`${categoryId}/${itemId}`);
}

export function listForumAnalysisLessonsInCategory(categoryId: ForumAnalysisCategoryId): ForumAnalysisLesson[] {
  const category = getForumAnalysisCategory(categoryId);
  if (!category) return [];
  return category.lessonOrder
    .map((id) => getForumAnalysisLesson(categoryId, id))
    .filter((lesson): lesson is ForumAnalysisLesson => Boolean(lesson));
}

export function listForumAnalysisStaticParams(): Array<{ categoryId: string; itemId: string }> {
  return FORUM_ANALYSIS_LESSONS.map((lesson) => ({
    categoryId: lesson.categoryId,
    itemId: lesson.id,
  }));
}

/** Match live analysis bullet text to a static lesson (for linking from forum lab UI). */
export function resolveForumAnalysisLessonFromBullet(
  categoryId: ForumAnalysisCategoryId,
  bulletText: string,
): ForumAnalysisLesson | undefined {
  const normalized = bulletText.trim().toLowerCase();
  return listForumAnalysisLessonsInCategory(categoryId).find(
    (lesson) => lesson.title.trim().toLowerCase() === normalized,
  );
}

export function forumAnalysisCategoryIdFromTitle(title: string): ForumAnalysisCategoryId | undefined {
  const map: Record<string, ForumAnalysisCategoryId> = {
    "Hammer themes": "hammer-themes",
    "Pakko themes": "pakko-themes",
    "Kelly opportunities": "kelly-opportunities",
    "Predicted debate questions": "predicted-debate-questions",
    "Watch for tells": "watch-for-tells",
    "Newspaper angles": "newspaper-angles",
    "Claims gate notes": "claims-gate-notes",
  };
  return map[title];
}

export const FORUM_ANALYSIS_HUB_LINKS: ForumAnalysisDrillDownLink[] = [
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
  { href: EP_FORUM_LAB_INTEGRATION_HREF, label: "7-day integration map" },
  { href: EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF, label: "Election law study" },
  { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
];