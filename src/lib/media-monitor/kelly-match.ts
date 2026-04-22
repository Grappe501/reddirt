import { ExternalMediaMatchTier, ExternalMediaMentionType, ExternalMediaSourceType } from "@prisma/client";

const ARK_HINTS = /\b(arkansas|ar\.gov|secretary of state|sos race|campaign|candidate|ballot|election)\b/i;

export type KellyMatchResult = {
  matchTier: ExternalMediaMatchTier;
  confidenceScore: number;
  mentionType: ExternalMediaMentionType;
  isOpinion: boolean;
  isEditorial: boolean;
};

function classifyFromPath(pathname: string): Pick<KellyMatchResult, "mentionType" | "isOpinion" | "isEditorial"> {
  const p = pathname.toLowerCase();
  let isOpinion = /\/opinion\b|\/voices\b|\/columns?\b/.test(p);
  let isEditorial = /\/editorial\b/.test(p);
  let mentionType: ExternalMediaMentionType = ExternalMediaMentionType.NEWS_ARTICLE;
  if (/\/letter|letters-to-the-editor|letter-to-the-editor/.test(p)) {
    mentionType = ExternalMediaMentionType.LETTER_TO_EDITOR;
    isOpinion = true;
  } else if (isEditorial) {
    mentionType = ExternalMediaMentionType.EDITORIAL;
  } else if (isOpinion || /\/blog\b|\/commentary\b/.test(p)) {
    mentionType = ExternalMediaMentionType.OPINION;
  } else if (/\/video\b|\/news\/video\b|\/watch\b/.test(p)) {
    mentionType = ExternalMediaMentionType.TV_WEB_STORY;
  }
  return { mentionType, isOpinion, isEditorial };
}

export function scoreKellyRelevance(text: string, url: string): KellyMatchResult {
  const blob = `${text}\n${url}`.toLowerCase();
  let pathname = "";
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = "";
  }
  const { mentionType, isOpinion, isEditorial } = classifyFromPath(pathname);

  const hasKellyGrappe = /\bkelly\s+wiles\s+grappe\b/.test(blob) || /\bkelly\s+grappe\b/.test(blob);
  const hasGrappe = /\bgrappe\b/.test(blob);
  const hasKellyAlone = /\bkelly\b/.test(blob) && !hasGrappe;

  let matchTier: ExternalMediaMatchTier;
  let confidenceScore: number;

  if (hasKellyGrappe) {
    matchTier = ExternalMediaMatchTier.DEFINITE;
    confidenceScore = 0.96;
  } else if (hasGrappe && ARK_HINTS.test(blob)) {
    matchTier = ExternalMediaMatchTier.LIKELY;
    confidenceScore = 0.78;
  } else if (hasGrappe) {
    matchTier = ExternalMediaMatchTier.UNCERTAIN;
    confidenceScore = 0.52;
  } else if (hasKellyAlone && /\bsecretary\b/.test(blob) && /\bstate\b/.test(blob)) {
    matchTier = ExternalMediaMatchTier.UNCERTAIN;
    confidenceScore = 0.45;
  } else {
    matchTier = ExternalMediaMatchTier.NOT_RELEVANT;
    confidenceScore = 0.12;
  }

  return { matchTier, confidenceScore, mentionType, isOpinion, isEditorial };
}

export function passesKeywordGate(title: string, summary: string, link: string): boolean {
  const t = `${title}\n${summary}\n${link}`.toLowerCase();
  if (/\bgrappe\b/.test(t)) return true;
  if (/\bkelly\s+wiles\b/.test(t)) return true;
  if (/\bkelly\b/.test(t) && /\b(secretary|sos|arkansas|campaign|candidate|ballot)\b/.test(t)) return true;
  return false;
}

export function defaultMentionTypeForTv(sourceType: ExternalMediaSourceType): ExternalMediaMentionType {
  return sourceType === ExternalMediaSourceType.TV ? ExternalMediaMentionType.TV_WEB_STORY : ExternalMediaMentionType.NEWS_ARTICLE;
}
