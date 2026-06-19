/**
 * Election Plan — 40-question debate reference hub metadata & EP link mapping.
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epForumLabDeepAnalysisLessonHref,
  epHammerBillHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import type { DrillDownLink } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import { SOS_DEBATE_SPEAK_ORDER_RULE } from "@/lib/intelligence/v4/sosDebateQuestionBank";

export const DEBATE_QUESTION_REFERENCE_HUB = {
  title: "40 expected debate questions",
  description:
    "The most likely moderator questions for a three-way Arkansas Secretary of State forum — with what Kim Hammer and Dr. Michael Pakko will say, Kelly's full scripts for first/second/third speak order, rebuttals, and cross-exchange handling.",
  opponentSummaries: {
    hammer: {
      title: "Kim Hammer — expected debate posture",
      narrative:
        "Hammer's default is legislative authorship as SOS readiness: election-integrity rankings, 'I wrote the bills,' sixteen years with clerks from the Capitol, and #1-state framing. He agrees on security first, then claims credit. He wants bill-list and experience debates — not county implementation ledgers.",
      bullets: [
        "Opens with secure elections and Heritage-style ranking language",
        "Collapses 'wrote the law' into 'can run elections'",
        "Cites 2021 six-bill package and Act numbers when pressed",
        "Says he stands with clerks — rarely offers county-by-county funding detail",
        "Avoids unfunded-mandate math; pivots to national integrity narrative",
      ],
    },
    pakko: {
      title: "Dr. Michael Pakko — expected debate posture",
      narrative:
        "Pakko plays the measured reform economist: both parties failed, more competition, less government friction, transparency and fiscal skepticism. He is not the operational target — Kelly agrees where true, then pivots to who administers Monday morning in seventy-five counties.",
      bullets: [
        "'Both parties failed' and anti-duopoly lines",
        "Competition and voter-choice themes without clerk-room detail",
        "Government spending / transparency agree-add opportunities",
        "Rarely attacks Kelly personally — differentiate administrator vs commentator",
        "May stay brief on implementation — Kelly owns the SOS service desk frame",
      ],
    },
  },
  howToUse: [
    "Start with HIGH-probability questions in your weakest categories.",
    "Read opponent summaries, then open the drill-down — rehearse all three speak-order scripts aloud.",
    "Use exchange blocks when Hammer or Pakko interrupt; never stop at 'I agree.'",
    "Claims gate on every page — verify act numbers and rankings before stage.",
  ],
  speakOrderRule: SOS_DEBATE_SPEAK_ORDER_RULE,
};

export function mapQuestionRelatedLinksForElectionPlan(drill: SosDebateQuestionDrillDown): DrillDownLink[] {
  const links: DrillDownLink[] = [
    { href: EP_DEBATE_QUESTIONS_HREF, label: "Question bank hub" },
    { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab" },
    { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Hammer profile" },
    { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Pakko profile" },
    { href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Agree-but-never-only-agree" },
    { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator" },
    { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
  ];

  if (drill.trapLaneHref) {
    const laneMatch = drill.trapLaneHref.match(/trap-lanes\/([^/?#]+)/);
    if (laneMatch) {
      links.unshift({ href: epTrapLaneHref(laneMatch[1]), label: "Trap lane drill" });
    }
  }

  for (const bill of drill.relatedBills) {
    links.unshift({ href: epHammerBillHref(bill), label: `${bill} — bill walkthrough` });
  }

  for (const link of drill.relatedLinks) {
    const mapped = mapStoredQuestionLinkForElectionPlan(link.href, link.label);
    if (mapped && !links.some((l) => l.href === mapped.href)) {
      links.push(mapped);
    }
  }

  return links;
}

function mapStoredQuestionLinkForElectionPlan(href: string, label: string): DrillDownLink | null {
  const billMatch = href.match(/\/bills\/([^/]+)(?:\/act-proof)?/);
  if (billMatch) {
    return { href: epHammerBillHref(billMatch[1]!), label: `${billMatch[1]} — bill walkthrough` };
  }
  const trapMatch = href.match(/trap-lanes\/([^/?#]+)/);
  if (trapMatch) {
    return { href: epTrapLaneHref(trapMatch[1]!), label: label || "Trap lane drill" };
  }
  if (href.includes("/admin/")) return null;
  return { href, label };
}
