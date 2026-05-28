import { buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { generateGovernedDraft } from "@/lib/intelligence/llmDraftGateway";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";

export const INTERNAL_DRAFT_LABEL = "INTERNAL_DRAFT" as const;

export type WritingDraftOutput = {
  draftStatus: typeof INTERNAL_DRAFT_LABEL;
  exportReady: false;
  publicationStatus: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  reviewStatus: "INTERNAL_DRAFT";
  recommendedHumanReviewer: string;
  title: string;
  sections: Array<{ heading: string; bullets: string[] }>;
  evidenceDependencies: string[];
  sourceDependencies: string[];
  safetyWarnings: string[];
  approvedEvidence: string[];
  interpretationNotes: string[];
};

function baseDraft(
  title: string,
  bullets: string[],
  repoRoot?: string,
): WritingDraftOutput {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const exportReadyClaims = evidence.claims.filter((row) => row.exportReady);
  const approvedEvidence = exportReadyClaims.map((row) => `${row.id}: ${row.text.slice(0, 120)}`);

  return {
    draftStatus: INTERNAL_DRAFT_LABEL,
    exportReady: false,
    publicationStatus: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    reviewStatus: "INTERNAL_DRAFT",
    recommendedHumanReviewer: "Campaign comms / research lead",
    title,
    sections: [{ heading: "Draft content", bullets }],
    evidenceDependencies: approvedEvidence.length
      ? approvedEvidence
      : ["No export-ready claims — gather evidence before field use."],
    sourceDependencies: approvedEvidence.map((row) => row.split(":")[0] ?? row),
    safetyWarnings: [
      "INTERNAL_DRAFT — not export-ready. Human review required.",
      "Do not use motive inference without statutory confirmation.",
      "No individual voter personalization or microtargeted persuasion.",
      "Distinguish approved evidence from operator interpretation.",
    ],
    approvedEvidence,
    interpretationNotes: ["All framing below is interpretive until reviewed against export-ready claims."],
  };
}

export function draftCandidateTalkingPoints(
  topic: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("candidate-talking-points", repoRoot);
  const bullets = [
    `Topic: ${topic}`,
    ...paper.whatCandidateNeedsToKnow.slice(0, 4),
    ...paper.whatNotToSay.slice(0, 2).map((line) => `Avoid: ${line}`),
  ];
  return baseDraft(`Candidate talking points — ${topic}`, bullets, repoRoot);
}

export function draftDebatePrepBlocks(
  billNumber: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);
  const bullets = [
    `Bill anchor: ${billNumber}`,
    ...paper.debateRelevance.slice(0, 3),
    ...paper.whatCandidateNeedsToKnow.slice(0, 2),
    "Structure: direct answer → sourced fact → values contrast → county impact → bridge.",
  ];
  return baseDraft(`Debate prep block — ${billNumber}`, bullets, repoRoot);
}

export function draftVolunteerTalkingPoints(
  countyId: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper(`county-${countyId}`, repoRoot);
  const bullets = [
    ...paper.whatVolunteersCanSafelySay.slice(0, 5),
    ...paper.whatNotToSay.slice(0, 2).map((line) => `Do not say: ${line}`),
  ];
  return baseDraft(`Volunteer script — ${countyId}`, bullets, repoRoot);
}

export function draftSocialMediaOptions(
  narrativeId: string,
  repoRoot?: string,
): WritingDraftOutput {
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const narrative = narratives.narratives.find((row) => row.narrativeId === narrativeId);
  const paper = buildStrategicBriefingPaper(`narrative-${narrativeId}`, repoRoot);
  const bullets = [
    narrative ? `Narrative: ${narrative.title} (${narrative.readinessBand})` : `Narrative: ${narrativeId}`,
    ...paper.whatCommsNeedsToKnow.slice(0, 3),
    "Social drafts require comms review — never auto-publish.",
  ];
  return baseDraft(`Social media options — ${narrativeId}`, bullets, repoRoot);
}

export function draftSurrogateBrief(
  audience: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("surrogate-brief", repoRoot);
  const bullets = [
    `Audience: ${audience}`,
    ...paper.executiveSummary.slice(0, 3),
    ...paper.whatCandidateNeedsToKnow.slice(0, 2),
    ...paper.risksAndBlockers.slice(0, 2),
  ];
  return baseDraft(`Surrogate brief — ${audience}`, bullets, repoRoot);
}

export function extractKeyWordsAndPhrases(repoRoot?: string): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("keywords", repoRoot);
  const bullets = [
    ...paper.executiveSummary.slice(0, 2),
    ...paper.strategicDoctrineAlignment.slice(0, 2),
    "Use doctrine-safe language only — verify against export-ready claims.",
  ];
  return baseDraft("Key words and phrases", bullets, repoRoot);
}

export function summarizeWhatNotToSay(repoRoot?: string): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("what-not-to-say", repoRoot);
  return baseDraft("What not to say today", paper.whatNotToSay, repoRoot);
}

export function convertBriefToPlainEnglish(
  paperId: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper(paperId, repoRoot);
  const bullets = [
    ...paper.executiveSummary,
    ...paper.whyItMatters.slice(0, 2),
  ];
  return baseDraft(`Plain English — ${paper.title}`, bullets, repoRoot);
}

export function convertBriefToFieldScript(
  countyId: string,
  repoRoot?: string,
): WritingDraftOutput {
  return draftVolunteerTalkingPoints(countyId, repoRoot);
}

export function draftStructuredCandidateTalkingPoints(
  topic: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("candidate-talking-points", repoRoot);
  return {
    ...baseDraft(`Structured candidate talking points — ${topic}`, [], repoRoot),
    title: `Structured candidate talking points — ${topic}`,
    recommendedHumanReviewer: "Candidate + comms director",
    sections: [
      { heading: "3 short points", bullets: paper.whatCandidateNeedsToKnow.slice(0, 3) },
      { heading: "3 expanded points", bullets: paper.executiveSummary.slice(0, 3) },
      { heading: "Values-based point", bullets: ["Trust, transparency, and county support for election administrators."] },
      { heading: "Accountability point", bullets: paper.strategicDoctrineAlignment.slice(0, 1) },
      { heading: "County-specific point", bullets: paper.countyImpact.slice(0, 1) },
      { heading: "Danger language", bullets: paper.whatNotToSay.slice(0, 2).map((l) => `DO NOT: ${l}`) },
    ],
  };
}

export function draftStructuredSocialMedia(
  narrativeId: string,
  repoRoot?: string,
): WritingDraftOutput {
  const base = draftSocialMediaOptions(narrativeId, repoRoot);
  return {
    ...base,
    recommendedHumanReviewer: "Comms director",
    sections: [
      { heading: "Short post", bullets: base.sections[0]?.bullets.slice(0, 2) ?? [] },
      { heading: "Thread outline", bullets: ["Hook → sourced fact → values → CTA to learn more (no auto-post)."] },
      { heading: "Quote-card text", bullets: ["[INTERNAL_DRAFT quote — verify citation before design]"] },
      { heading: "Plain-English explainer", bullets: base.sections[0]?.bullets.slice(2, 4) ?? [] },
      { heading: "Do-not-post warning", bullets: ["Blocked narratives", "Partial citations", "Unverified media findings"] },
    ],
  };
}

export function draftStructuredVolunteerScripts(
  countyId: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper(`county-${countyId}`, repoRoot);
  return {
    ...baseDraft(`Volunteer scripts — ${countyId}`, [], repoRoot),
    recommendedHumanReviewer: "Field organizer",
    sections: [
      { heading: "Doorstep version", bullets: paper.whatVolunteersCanSafelySay.slice(0, 2) },
      { heading: "Phone-bank version", bullets: paper.whatVolunteersCanSafelySay.slice(0, 2) },
      { heading: "Church/community version", bullets: ["Community-focused trust frame — no partisan attack language."] },
      { heading: "Local meeting version", bullets: paper.whatFieldTeamNeedsToKnow.slice(0, 2) },
      { heading: "Say this / don't say this", bullets: [...paper.whatVolunteersCanSafelySay.slice(0, 1), ...paper.whatNotToSay.slice(0, 2).map((l) => `Don't: ${l}`)] },
    ],
  };
}

export function draftStructuredPressSurrogate(
  audience: string,
  repoRoot?: string,
): WritingDraftOutput {
  const paper = buildStrategicBriefingPaper("surrogate-brief", repoRoot);
  return {
    ...baseDraft(`Press/surrogate — ${audience}`, [], repoRoot),
    recommendedHumanReviewer: "Press secretary",
    sections: [
      { heading: "Press quote", bullets: ["[INTERNAL_DRAFT — export-ready claim required before release]"] },
      { heading: "Surrogate memo", bullets: paper.executiveSummary.slice(0, 3) },
      { heading: "Reporter Q&A", bullets: paper.whatCandidateNeedsToKnow.slice(0, 3) },
      { heading: "Attack/response grid", bullets: [...paper.risksAndBlockers.slice(0, 2), "Response: redirect to statutory record and Kelly values frame."] },
    ],
  };
}

export function enqueueWritingToolboxLlmDraft(
  templateId: "candidate-talking-points" | "volunteer-script" | "social-post-draft" | "surrogate-memo" | "press-statement" | "plain-english-explainer",
  generatedForRoute: string,
  repoRoot?: string,
): string | null {
  const result = generateGovernedDraft({
    templateId,
    generatedByTool: `writing-toolbox:${templateId}`,
    generatedForRoute,
    repoRoot,
  });
  return result.draft.draftId;
}

export function listWritingToolboxCapabilities(): string[] {
  return [
    "draftCandidateTalkingPoints",
    "draftStructuredCandidateTalkingPoints",
    "draftDebatePrepBlocks",
    "draftVolunteerTalkingPoints",
    "draftStructuredVolunteerScripts",
    "draftSocialMediaOptions",
    "draftStructuredSocialMedia",
    "draftSurrogateBrief",
    "draftStructuredPressSurrogate",
    "extractKeyWordsAndPhrases",
    "summarizeWhatNotToSay",
    "convertBriefToPlainEnglish",
    "convertBriefToFieldScript",
    "enqueueWritingToolboxLlmDraft",
  ];
}
